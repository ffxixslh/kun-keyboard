import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { KEYMAP } from '../constants/keymap'

export const useKeyupPlaySound = () => {
  const [keyupInputs, setKeyupInputs] = useState<string[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const audioBuffersRef = useRef<Map<string, AudioBuffer>>(new Map())

  const handleLoad = async (url: string) => {
    if (audioBuffersRef.current.has(url)) return

    const audioCtx = audioCtxRef.current
    if (!audioCtx) throw new Error('No audio context')

    const audioRes = await fetch(url)
    const arrayBuffer = await audioRes.arrayBuffer()
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer)
    audioBuffersRef.current.set(url, audioBuffer)
  }

  const handlePlay = async (url: string) => {
    const audioCtx = audioCtxRef.current
    if (!audioCtx) throw new Error('No audio context')

    const audioBuffer = audioBuffersRef.current.get(url)
    if (!audioBuffer) throw new Error('No audio buffer')

    await audioCtx.resume()

    const source = audioCtx.createBufferSource()
    source.buffer = audioBuffer
    source.onended = () => {
      source.disconnect()
    }
    source.connect(audioCtx.destination)
    source.start(0)
  }

  const handleKeyup = useCallback(async (e: KeyboardEvent) => {
    const audioCtx = audioCtxRef.current
    if (!audioCtx) throw new Error('No audio context')

    if (
      e.key.length !== 1
      && !(['Control'].includes(e.key))
    ) return

    const audioUrl = KEYMAP[e.key]
    if (!audioUrl) return

    setKeyupInputs(prev => [...prev, e.key])

    await handleLoad(audioUrl)
    await handlePlay(audioUrl)
  }, [])

  const handleControl = useCallback(async (e: KeyboardEvent) => {
    if (e.key !== ' ') return

    const audioCtx = audioCtxRef.current
    if (!audioCtx) throw new Error('No audio context')

    if (isPlaying) {
      await audioCtx.suspend()
      setIsPlaying(false)

      return
    }
    else {
      await audioCtx.resume()
      setIsPlaying(true)

      return
    }
  }, [isPlaying])

  // initialize audioContext
  useEffect(() => {
    const audioCtx = new AudioContext()
    audioCtxRef.current = audioCtx

    return () => void audioCtx.close()
  }, [])

  // add keydown event to window
  useEffect(() => {
    window.addEventListener('keyup', handleKeyup)
    window.addEventListener('keydown', handleControl)

    return () => {
      window.removeEventListener('keyup', handleKeyup)
      window.removeEventListener('keydown', handleControl)
    }
  }, [handleKeyup, handleControl])

  return {
    isPlaying,
    setIsPlaying,
    keyupInputs,
    setKeyupInputs,
  }
}
