import { useCallback, useRef, useEffect } from 'react'

interface KeySound {
  key: string
  timestamp: number
  soundUrl: string
}

interface KeyboardSoundQueueOptions {
  enabled?: boolean
  volume?: number
  maxQueueSize?: number
  defaultSoundUrl?: string
  soundMap?: Record<string, string> // 特定按键对应的音效
  onQueueUpdate?: (queue: KeySound[]) => void
}

export function useTypeSound({
  enabled = true,
  volume = 0.5,
  maxQueueSize = 10,
  defaultSoundUrl = '/src/assets/tracks/jntm.mp3',
  soundMap = {},
  onQueueUpdate,
}: KeyboardSoundQueueOptions = {}) {
  const audioContextRef = useRef<AudioContext | null>(null)
  const soundBuffersRef = useRef<Map<string, AudioBuffer>>(new Map())
  const queueRef = useRef<KeySound[]>([])
  const isPlayingRef = useRef(false)

  // 加载音效
  const loadSound = useCallback(async (url: string) => {
    if (!audioContextRef.current || soundBuffersRef.current.has(url)) return

    try {
      const response = await fetch(url)
      const arrayBuffer = await response.arrayBuffer()
      const audioBuffer = await audioContextRef.current
        .decodeAudioData(arrayBuffer)
      soundBuffersRef.current.set(url, audioBuffer)
    }
    catch (error) {
      console.error('Failed to load sound:', error)
    }
  }, [])

  // 播放单个音效
  const playSound = useCallback((keySound: KeySound) => {
    if (!audioContextRef.current) return

    const soundUrl = soundMap[keySound.key] || defaultSoundUrl
    const buffer = soundBuffersRef.current.get(soundUrl)
    if (!buffer) return

    try {
      const source = audioContextRef.current.createBufferSource()
      const gainNode = audioContextRef.current.createGain()

      source.buffer = buffer
      gainNode.gain.value = volume

      source.connect(gainNode)
      gainNode.connect(audioContextRef.current.destination)

      // 返回一个Promise，在音效播放完成时resolve
      source.onended = () => {
        source.disconnect()
        gainNode.disconnect()
      }
      source.start(0)
    }
    catch (error) {
      console.warn('Failed to play sound:', error)
    }
  }, [volume, soundMap, defaultSoundUrl])

  // 处理音效队列
  const processQueue = useCallback(() => {
    if (isPlayingRef.current || queueRef.current.length === 0) return

    try {
      isPlayingRef.current = true

      while (queueRef.current.length > 0) {
        const keySound = queueRef.current[0]
        playSound(keySound)
        // 移除已播放的音效
        queueRef.current.shift()
        onQueueUpdate?.(queueRef.current)
      }
    }
    catch (error) {
      console.error('Failed to process queue:', error)
    }
    finally {
      isPlayingRef.current = false
    }
  }, [playSound, onQueueUpdate])

  // 添加按键到队列
  const addToQueue = useCallback(
    (key: string) => {
      if (!enabled) return

      const keySound: KeySound = {
        key,
        timestamp: Date.now(),
        soundUrl: soundMap[key] || defaultSoundUrl,
      }

      // 如果队列已满，移除最早的按键
      if (queueRef.current.length >= maxQueueSize) {
        queueRef.current.shift()
      }

      queueRef.current.push(keySound)
      onQueueUpdate?.(queueRef.current)

      try {
      // 开始处理队列
        processQueue()
      }
      catch (r) {
        console.error('Failed to process queue:', r)
      }
    },
    [
      enabled, maxQueueSize,
      processQueue, onQueueUpdate,
      soundMap, defaultSoundUrl,
    ],
  )

  // 初始化 AudioContext 和加载音效
  useEffect(() => {
    const audioContext = new AudioContext()
    audioContextRef.current = audioContext

    const soundBuffers = soundBuffersRef.current

    // 加载所有音效
    const loadAllSounds = async () => {
      await loadSound(defaultSoundUrl)
      await Promise.all(Object.values(soundMap).map(loadSound))
    }

    loadAllSounds()
      .catch((error) => {
        console.error('Failed to load all sounds:', error)
      })

    return () => {
      if (audioContext.state !== 'closed') {
        audioContext.close().catch(() => {})
      }
      soundBuffers.clear()
    }
  }, [defaultSoundUrl, loadSound, soundMap])

  // 监听键盘事件
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 忽略组合键
      if (e.ctrlKey || e.altKey || e.metaKey) return

      // 只处理普通字符和特殊按键
      if (
        e.key.length === 1
        || ['Enter', 'Backspace', 'Space'].includes(e.key)) {
        addToQueue(e.key)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () =>
      window.removeEventListener('keydown', handleKeyDown)
  }, [addToQueue])

  // 恢复 AudioContext
  const resumeAudioContext = useCallback(async () => {
    if (audioContextRef.current?.state === 'suspended') {
      await audioContextRef.current.resume()
    }
  }, [])

  return {
    queue: queueRef.current,
    isPlaying: isPlayingRef.current,
    clearQueue: () => {
      queueRef.current = []
      onQueueUpdate?.([])
    },
    resumeAudioContext,
  }
}
