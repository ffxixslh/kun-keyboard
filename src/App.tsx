import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import './App.css'

type KeyMap = {
  [key: string]: string
}
const keyMap: KeyMap = {
  a: '/src/assets/audios/ay.mp3',
  c: '/src/assets/audios/c.mp3',
  g: '/src/assets/audios/grlxs.mp3',
  h: '/src/assets/audios/hh.mp3',
  j: '/src/assets/audios/jntm.mp3',
  l: '/src/assets/audios/lblhnkg.mp3',
  m: '/src/assets/audios/music.mp3',
  n: '/src/assets/audios/ngmay.wav',
  p: '/src/assets/audios/pshlhd.mp3',
  q: '/src/assets/audios/qmzzrmdjh.mp3',
  r: '/src/assets/audios/rap.mp3',
  t: '/src/assets/audios/tp.wav',
  Control: '/src/assets/audios/ctrl.wav',
  ['1']: '/src/assets/musics/鸡你太美.mp3',
}

function App() {
  const [queueDisplay, setQueueDisplay] = useState<string[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const audioBuffersRef = useRef<Map<string, AudioBuffer>>(new Map())

  const handleLoad = async (url: string) => {
    if (!audioCtxRef.current || audioBuffersRef.current.has(url)) return

    const audioRes = await fetch(url)
    const arrayBuffer = await audioRes.arrayBuffer()
    const audioBuffer = await audioCtxRef.current.decodeAudioData(arrayBuffer)
    audioBuffersRef.current.set(url, audioBuffer)
  }

  const handlePlay = (url: string) => {
    if (!audioCtxRef.current) return console.error('No audio context')

    const audioBuffer = audioBuffersRef.current.get(url)
    if (!audioBuffer) return console.error('No audio buffer')

    const source = audioCtxRef.current.createBufferSource()
    source.buffer = audioBuffer
    source.onended = () => {
      source.disconnect()
      setIsPlaying(false)
    }
    source.connect(audioCtxRef.current.destination)
    source.start(0)
    setIsPlaying(true)
  }

  const handleKeydown = useCallback(async (e: KeyboardEvent) => {
    const audioCtx = audioCtxRef.current
    if (!audioCtx) return

    if (
      e.key.length !== 1
      && !(['Control'].includes(e.key))
    ) return

    const musicUrl = keyMap[e.key]
    if (!musicUrl) return

    setQueueDisplay(prev => [...prev, e.key])
    await handleLoad(musicUrl)
    handlePlay(musicUrl)
  }, [])

  const handlePause = async (e: KeyboardEvent) => {
    if (e.key !== ' ') return

    const audioCtx = audioCtxRef.current
    if (!audioCtx) return

    if (audioCtx.state === 'running') {
      await audioCtx?.suspend()
      setIsPlaying(false)

      return
    }

    if (audioCtx.state === 'suspended') {
      await audioCtx?.resume()
      setIsPlaying(true)

      return
    }
  }

  // initialize audioContext
  useEffect(() => {
    const audioCtx = new AudioContext()
    audioCtxRef.current = audioCtx

    return () => void audioCtx.close()
  }, [])

  // add keydown event to window
  useEffect(() => {
    window.addEventListener('keydown', handleKeydown)
    window.addEventListener('keydown', handlePause)

    return () => {
      window.removeEventListener('keydown', handleKeydown)
      window.removeEventListener('keydown', handlePause)
    }
  }, [handleKeydown])

  return (
    <div className="grid pic container h-screen bg-grlxs">
      <div>
        <button
          className="ring-1 ring-gray-600"
          onClick={() => setQueueDisplay([])}
        >
          Reset
        </button>
      </div>
      <div className="text-center">
        <button onClick={() => setIsPlaying(p => !p)}>
          {isPlaying ? 'Stop' : 'Play'}
        </button>
        <div>
          queue:
          {queueDisplay.join('')}
        </div>
      </div>
    </div>
  )
}

export default App
