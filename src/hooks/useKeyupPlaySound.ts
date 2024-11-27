import { useCallback, useEffect, useRef, useState } from 'react'
import { getKeyMusic } from '../constants/keymap'
import { getKeyboardEventKey } from '../constants/keyboard'
import {
  createWavChunk,
  HEADER_SIZE,
  isValidWavHeader,
} from '../utils/chunkWavFile'
export const useKeyupPlaySound = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const slicedChunksMapRef = useRef<
    Map<
      string,
      {
        chunks: AudioBuffer[]
        index: number
      }
    >
  >(new Map())
  const cachedBufferMapRef = useRef<Map<string, AudioBuffer>>(new Map())
  const clearAudioCtxRef = useRef<() => void>()

  const handleInitAudioContext = useCallback(function handleInitAudioContext() {
    audioCtxRef.current = new AudioContext()
    const handleClearAudioCtx = () => {
      void audioCtxRef.current?.close()
      audioCtxRef.current = null
    }

    return handleClearAudioCtx
  }, [])

  const handlePlayNextBuffer = useCallback(function handlePlayNextBuffer(
    url: string,
    index = 0,
  ) {
    return new Promise<void>((resolve, reject) => {
      if (!audioCtxRef.current) {
        return reject(new Error('Start: No audio context'))
      }

      try {
        const slicedChunks = slicedChunksMapRef.current.get(url)?.chunks
        if (slicedChunks && slicedChunks.length - 1 < index) return
        const audioBuffer = slicedChunksMapRef.current.get(url)?.chunks[index]
        if (!audioBuffer) {
          return reject(new Error('Start: No audio buffer'))
        }

        const source = audioCtxRef.current.createBufferSource()
        source.buffer = audioBuffer
        source.connect(audioCtxRef.current.destination)
        source.onended = async () => {
          source.disconnect()
          const nextIndex = index + 1
          await handlePlayNextBuffer(url, nextIndex)
          setIsPlaying(false)
        }
        source.start(0)
        setIsPlaying(true)
        resolve()
      } catch (err) {
        console.error(err)
      }
    })
  }, [])

  const handlePlayCachedBuffer = useCallback(function handlePlayCachedBuffer(
    url: string,
  ) {
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
      if (cachedBufferMapRef.current.has(url)) {
        handlePlayCachedBuffer(url)

        return
      }

      try {
        const audioRes = await fetch(url)

        // start slicing buffer
        const reader = audioRes.body?.getReader()
        if (!reader) throw new Error('No reader')
        const fileLength = Number(audioRes.headers.get('content-length'))
        if (!fileLength) throw new Error('No content length')
        const mergedChunk = new Uint8Array(fileLength)

        let offset = 0
        let index = 0
        let header: DataView | null = null
        while (offset < fileLength) {
          const { done, value } = await reader.read()
          if (done) break
          if (!header) {
            header = new DataView(value.buffer.slice(0, HEADER_SIZE))
          }

          let wavChunk: Uint8Array
          if (isValidWavHeader(header) && index !== 0) {
            wavChunk = new Uint8Array(
              createWavChunk(
                new Uint8Array(value.buffer.slice(0)).buffer,
                header,
              ),
            )
          } else {
            wavChunk = new Uint8Array(value.buffer.slice(0))
          }

          const slicedAudioBuffer = await audioCtxRef.current.decodeAudioData(
            wavChunk.buffer,
          )
          slicedChunksMapRef.current.set(url, {
            chunks: [
              ...(slicedChunksMapRef.current.get(url)?.chunks ?? []),
              slicedAudioBuffer,
            ],
            index,
          })
          if (slicedChunksMapRef.current.get(url)?.chunks.length === 1) {
            await handlePlayNextBuffer(url, index)
          }

          const chunk = new Uint8Array(value.buffer.slice(0))
          mergedChunk.set(chunk, offset)
          offset += value.byteLength
          index += 1
        }
        const mergedAudioBuffer = await audioCtxRef.current.decodeAudioData(
          mergedChunk.buffer,
        )
        cachedBufferMapRef.current.set(url, mergedAudioBuffer)
      } catch (err) {
        console.error(err)
      }
    },
    [handlePlayNextBuffer, handlePlayCachedBuffer],
  )

  const handleProcessBuffer = useCallback(
    async function handleProcessBuffer(key: string) {
      if (!audioCtxRef.current) {
        const handleClearAudioCtx = handleInitAudioContext()
        clearAudioCtxRef.current = handleClearAudioCtx
      }

      const audioUrl = getKeyMusic(key)
      if (!audioUrl) return
      try {
        await audioCtxRef.current?.resume()
        await handleLoadBuffer(audioUrl)
      } catch (err) {
        console.error(err)
      }
    },
    [handleInitAudioContext, handleLoadBuffer],
  )

  const handleControl = useCallback(
    async function handleControl(e?: KeyboardEvent | React.MouseEvent) {
      if (!audioCtxRef.current) return
      try {
        if (e instanceof KeyboardEvent && e.key !== ' ') return
        if (e instanceof MouseEvent && e.type !== 'click') return
        if (audioCtxRef.current.state === 'closed') return
        if (isPlaying && audioCtxRef.current.state === 'running') {
          await audioCtxRef.current.suspend()
          setIsPlaying(false)
        }

        if (!isPlaying && audioCtxRef.current.state === 'suspended') {
          await audioCtxRef.current.resume()
          setIsPlaying(true)
        }

        return
      } catch (err) {
        console.error(err)
      }
    },
    [isPlaying],
  )

  const handleKeyup = useCallback(
    async function handleKeyup(e: KeyboardEvent) {
      try {
        const key = e.key
        if (key.length !== 1 && !['Control'].includes(key)) return
        if (key === ' ') {
          await handleControl()

          return
        }

        await handleProcessBuffer(key)
      } catch (err) {
        console.error(err)
      }
    },
    [handleControl, handleProcessBuffer],
  )

  const handleClick = useCallback(
    async function handleClick(value: string) {
      try {
        const key = getKeyboardEventKey(value)
        if (key === ' ') {
          await handleControl()

          return
        }

        await handleProcessBuffer(key)
      } catch (err) {
        console.error(err)
      }
    },
    [handleControl, handleProcessBuffer],
  )

  const handleReset = () => {
    try {
      if (clearAudioCtxRef.current) {
        clearAudioCtxRef.current()
        clearAudioCtxRef.current = undefined
      }
      setIsPlaying(false)
      const handleClearAudioCtx = handleInitAudioContext()
      clearAudioCtxRef.current = handleClearAudioCtx
    } catch (err) {
      console.error(err)
    }
  }

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
