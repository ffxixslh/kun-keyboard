import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { getKeyMusic } from '../constants/keymap'
import { getKeyboardEventKey } from '../constants/keyboard'

export const useKeyupPlaySound = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const slicedChunksMapRef = useRef<Map<string, {
    chunks: AudioBuffer[]
    index: number
  }>>(new Map())
  const cachedBufferMapRef = useRef<Map<string, AudioBuffer>>(new Map())

  const handleInitAudioContext = useCallback(() => {
    if (audioCtxRef.current) return

    const audioCtx = new AudioContext()
    audioCtxRef.current = audioCtx

    const handleClearAudioCtx = () => {
      void audioCtx.close()
      audioCtxRef.current = null
    }

    return handleClearAudioCtx
  }, [])

  const handlePlayNextBuffer = useCallback(async (
    url: string,
    index = 0,
  ) => {
    const audioCtx = audioCtxRef.current
    if (!audioCtx) throw new Error('Start: No audio context (never)')

    try {
      const slicedChunks = slicedChunksMapRef.current.get(url)?.chunks
      if (slicedChunks && slicedChunks.length - 1 < index) return
      const indexedChunk = slicedChunksMapRef.current
        .get(url)?.chunks[index]

      const audioBuffer = indexedChunk
      if (!audioBuffer) throw new Error('Start: No audio buffer')

      await audioCtx.resume()

      const source = audioCtx.createBufferSource()
      source.buffer = audioBuffer
      source.connect(audioCtx.destination)
      source.onended = () => {
        source.disconnect()

        const nextIndex = index + 1
        void handlePlayNextBuffer(url, nextIndex)

        if (slicedChunks && nextIndex > slicedChunks?.length - 1) {
          setIsPlaying(false)
        }
      }
      source.start(0)

      setIsPlaying(true)
    }
    catch (err) {
      console.error(err)
    }
  }, [])

  const handlePlayCachedBuffer = useCallback((url: string) => {
    const audioCtx = audioCtxRef.current
    if (!audioCtx) throw new Error('Start: No audio context')

    const arrayBuffer = cachedBufferMapRef.current.get(url)
    if (!arrayBuffer) throw new Error('No audio buffer')

    const sourceNode = audioCtx.createBufferSource()
    sourceNode.buffer = arrayBuffer
    sourceNode.connect(audioCtx.destination)
    sourceNode.start(0)
  }, [])

  const handleLoadBuffer = useCallback(async (url: string) => {
    const audioCtx = audioCtxRef.current
    if (!audioCtx) throw new Error('No audio context')

    const cachedBuffer = cachedBufferMapRef.current.has(url)
    if (cachedBuffer) {
      void handlePlayCachedBuffer(url)

      return
    }

    const audioRes = await fetch(url)

    // start slicing buffer
    const reader = audioRes.body?.getReader()
    if (!reader) throw new Error('No reader')

    const fileLength = Number(audioRes.headers.get('content-length'))
    if (!fileLength) throw new Error('No content length')

    const mergedChunk = new Uint8Array(fileLength)
    slicedChunksMapRef.current.set(url, {
      index: 0,
      chunks: [],
    })

    let offset = 0
    let index = 0
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = new Uint8Array(value.buffer)
      mergedChunk.set(chunk, offset)
      offset += value.byteLength

      const slicedAudioBuffer = await audioCtx
        .decodeAudioData(chunk.buffer)

      slicedChunksMapRef.current.set(url, {
        chunks: [
          ...(slicedChunksMapRef.current.get(url)?.chunks) ?? [],
          slicedAudioBuffer,
        ],
        index,
      })

      if (slicedChunksMapRef.current.get(url)?.chunks.length === 1) {
        void await handlePlayNextBuffer(url, index)
      }

      index += 1
    }
    const mergedAudioBuffer = await audioCtx
      .decodeAudioData(mergedChunk.buffer)
    cachedBufferMapRef.current.set(url, mergedAudioBuffer)
  }, [handlePlayNextBuffer, handlePlayCachedBuffer])

  const handleProcessBuffer = useCallback(async (key: string) => {
    const audioCtx = audioCtxRef.current
    if (!audioCtx) throw new Error('Perform: No audio context')

    const audioUrl = getKeyMusic(key)
    if (!audioUrl) return

    await handleLoadBuffer(audioUrl)
  }, [handleLoadBuffer])

  const handleControl = useCallback(
    async (e?: KeyboardEvent | React.MouseEvent) => {
      if (e instanceof KeyboardEvent && e.key !== ' ') return
      if (e instanceof MouseEvent && e.type !== 'click') return

      const audioCtx = audioCtxRef.current
      if (!audioCtx) throw new Error('Control: No audio context')

      if (audioCtx.state === 'closed') return

      if (isPlaying && audioCtx.state === 'running') {
        await audioCtx.suspend()
        setIsPlaying(false)

        return
      }

      if (!isPlaying && audioCtx.state === 'suspended') {
        await audioCtx.resume()
        setIsPlaying(true)

        return
      }

      return
    },
    [isPlaying])

  const handleKeyup = useCallback(async (e: KeyboardEvent) => {
    const key = e.key
    if (
      key.length !== 1
      && !(['Control'].includes(key))
    ) return
    if (key === ' ') {
      await handleControl()

      return
    }

    await handleProcessBuffer(key)
  }, [handleControl, handleProcessBuffer])

  const handleClick = useCallback(async (
    value: string,
  ) => {
    const key = getKeyboardEventKey(value)
    if (key === ' ') {
      await handleControl()

      return
    }

    await handleProcessBuffer(key)
  }, [handleControl, handleProcessBuffer])

  const handleReset = () => {
    void audioCtxRef.current?.close()
    audioCtxRef.current = null
    setIsPlaying(false)

    handleInitAudioContext()
  }

  // initialize audioContext
  useEffect(() => {
    const handleClearAudioCtx = handleInitAudioContext()

    return handleClearAudioCtx
  }, [handleInitAudioContext])

  // add keydown event to window
  useEffect(() => {
    window.addEventListener('keyup', handleKeyup)
    window.addEventListener('keyup', handleControl)

    return () => {
      window.removeEventListener('keyup', handleKeyup)
      window.removeEventListener('keyup', handleControl)
    }
  }, [handleKeyup, handleControl])

  return {
    isPlaying,
    handleClick,
    handleControl,
    handleReset,
  }
}
