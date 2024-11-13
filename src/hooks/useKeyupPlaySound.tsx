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

  const handleInitAudioCtx = useCallback(() => {
    if (audioCtxRef.current) return

    const audioCtx = new AudioContext()
    audioCtxRef.current = audioCtx

    const handleClearAudioCtx = () => {
      void audioCtx.close()
      audioCtxRef.current = null
    }

    return handleClearAudioCtx
  }, [])

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
      setIsPlaying(false)
    }
    source.connect(audioCtx.destination)
    source.start(0)
  }

  const handleKeyup = useCallback(async (e: KeyboardEvent) => {
    const audioCtx = audioCtxRef.current
    if (!audioCtx) handleInitAudioCtx()

    if (
      e.key.length !== 1
      && !(['Control'].includes(e.key))
    ) return

    const audioUrl = KEYMAP[e.key]
    if (!audioUrl) return

    await handleLoad(audioUrl)
    await handlePlay(audioUrl)

    setKeyupInputs(prev => [...prev, e.key])
    setIsPlaying(true)
  }, [handleInitAudioCtx])

  const handleControl = useCallback(
    async (e: KeyboardEvent | React.MouseEvent) => {
      if (e instanceof KeyboardEvent && e.key !== ' ') return
      if (e instanceof MouseEvent && e.type !== 'click') return

      const audioCtx = audioCtxRef.current
      if (!audioCtx) throw new Error('No audio context')

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

  const handleReset = () => {
    void audioCtxRef.current?.close()
    audioCtxRef.current = null
    setKeyupInputs([])
    setIsPlaying(false)
  }

  // initialize audioContext
  useEffect(() => {
    const handleClearAudioCtx = handleInitAudioCtx()

    return handleClearAudioCtx
  }, [handleInitAudioCtx])

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
    keyupInputs,
    handleControl,
    handleReset,
  }
}
