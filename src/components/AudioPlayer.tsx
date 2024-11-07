import { FC, useEffect, useRef, useState } from 'react'
import { Track } from '../constants/tracks'

interface AudioProps {
  track: Track
}

export const AudioPlayer: FC<AudioProps> = ({ track }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const audioSourceRef = useRef<MediaElementAudioSourceNode | null>(null)

  const handlePlay = async () => {
    const audioElement = audioRef.current
    if (!audioElement) return
    const audioContext = audioContextRef.current
    if (!audioContext) return

    const source = audioContext.createBufferSource()
    const response = await fetch(track.src)
    const buffer = await response.arrayBuffer()
    const decodedBuffer = await audioContext.decodeAudioData(buffer)
    source.buffer = decodedBuffer
    source.connect(audioContext.destination)
    source.start()

    if (audioContext.state === 'suspended') {
      await audioContext.resume()
    }

    if (isPlaying) {
      setIsPlaying(false)
      audioElement.pause()
    }
    else {
      setIsPlaying(true)
      await audioElement.play()
    }
  }

  useEffect(() => {
    const audioElement = audioRef.current
    if (!audioElement) return

    let audioContext = audioContextRef.current
    let track = audioSourceRef.current

    const handleUserInteraction = () => {
      if (!audioContext) {
        audioContext = new AudioContext()
        audioContextRef.current = audioContext
      }

      if (!track) {
        track = audioContext.createMediaElementSource(audioElement)
        track.connect(audioContext.destination)
        audioSourceRef.current = track
      }
    }

    // Listen for a user gesture (e.g., click)
    window.addEventListener('click', handleUserInteraction, { once: true })

    // Cleanup the event listener
    return () => {
      window.removeEventListener('click', handleUserInteraction)
    }
  }, [])

  useEffect(() => {
    const audioElement = audioRef.current
    if (!audioElement) return

    const handleEnded = () => {
      setIsPlaying(false)
    }

    audioElement.addEventListener('ended', handleEnded)

    return () => {
      audioElement.removeEventListener('ended', handleEnded)
    }
  }, [])

  useEffect(() => {
    const audioElement = audioRef.current
    if (!audioElement) return

    const audioSource = audioContextRef.current
    if (!audioSource) return

    audioElement.src = (new URL(track.src)).pathname
  }, [track])

  return (
    <div className="w-full justify-center">
      <audio
        ref={audioRef}
        crossOrigin="anonymous"
      />
      <button onClick={() => void handlePlay()}>
        {isPlaying ? 'Pause' : 'Play'}
      </button>
    </div>
  )
}
