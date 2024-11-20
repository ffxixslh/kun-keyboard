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

  const handleInitAudioContext = useCallback(
    function handleInitAudioContext() {
      audioCtxRef.current = new AudioContext()

      const handleClearAudioCtx = () => {
        audioCtxRef.current = null
        new AudioContext().close()
          .catch(e => console.error(e))
      }

      return handleClearAudioCtx
    }, [])

  const handlePlayNextBuffer = useCallback(
    async function handlePlayNextBuffer(
      url: string,
      index = 0,
    ) {
      if (!audioCtxRef.current) throw new Error('Start: No audio context')

      try {
        const slicedChunks = slicedChunksMapRef.current.get(url)?.chunks
        if (slicedChunks && slicedChunks.length - 1 < index) return
        const indexedChunk = slicedChunksMapRef.current
          .get(url)?.chunks[index]

        const audioBuffer = indexedChunk
        if (!audioBuffer) throw new Error('Start: No audio buffer')

        await audioCtxRef.current.resume()

        const source = audioCtxRef.current.createBufferSource()
        source.buffer = audioBuffer
        source.connect(audioCtxRef.current.destination)
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

  const handlePlayCachedBuffer = useCallback(
    function handlePlayCachedBuffer(url: string) {
      const audioCtx = audioCtxRef.current
      if (!audioCtx) throw new Error('Start: No audio context')

      const arrayBuffer = cachedBufferMapRef.current.get(url)
      if (!arrayBuffer) throw new Error('No audio buffer')

      const sourceNode = audioCtx.createBufferSource()
      sourceNode.buffer = arrayBuffer
      sourceNode.connect(audioCtx.destination)
      sourceNode.start(0)
    }, [])

  const handleLoadBuffer = useCallback(
    async function handleLoadBuffer(url: string) {
      if (!audioCtxRef.current) throw new Error('No audio context')

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

        const slicedAudioBuffer = await audioCtxRef.current
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
      const mergedAudioBuffer = await audioCtxRef.current
        .decodeAudioData(mergedChunk.buffer)
      cachedBufferMapRef.current.set(url, mergedAudioBuffer)
    }, [handlePlayNextBuffer, handlePlayCachedBuffer])

  const handleProcessBuffer = useCallback(
    async function handleProcessBuffer(key: string) {
      if (!audioCtxRef.current) throw new Error('Perform: No audio context')

      const audioUrl = getKeyMusic(key)
      if (!audioUrl) return

      try {
        await handleLoadBuffer(audioUrl)
      }
      catch (err) {
        console.error(err)
      }
    }, [handleLoadBuffer])

  const handleControl = useCallback(
    async function handleControl(e?: KeyboardEvent | React.MouseEvent) {
      if (e instanceof KeyboardEvent && e.key !== ' ') return
      if (e instanceof MouseEvent && e.type !== 'click') return

      if (!audioCtxRef.current) throw new Error('Control: No audio context')

      try {
        if (audioCtxRef.current.state === 'closed') return

        if (isPlaying && audioCtxRef.current.state === 'running') {
          await audioCtxRef.current.suspend()
          setIsPlaying(false)

          return
        }

        if (!isPlaying && audioCtxRef.current.state === 'suspended') {
          await audioCtxRef.current.resume()
          setIsPlaying(true)

          return
        }

        return
      }
      catch (err) {
        console.error(err)
      }
    }, [isPlaying])

  const handleKeyup = useCallback(
    async function handleKeyup(e: KeyboardEvent) {
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

  const handleClick = useCallback(
    async function handleClick(
      value: string,
    ) {
      const key = getKeyboardEventKey(value)
      if (key === ' ') {
        await handleControl()

        return
      }

      await handleProcessBuffer(key)
    }, [handleControl, handleProcessBuffer])

  const handleReset = async () => {
    await audioCtxRef.current?.close()
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
