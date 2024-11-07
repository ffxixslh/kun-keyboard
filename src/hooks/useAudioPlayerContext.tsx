import { useContext } from 'react'
import { AudioPlayerContext } from '../contexts/audioContext'

export const useAudioPlayerContext = () => {
  const audioPlayerContext = useContext(AudioPlayerContext)

  if (!audioPlayerContext) {
    throw new Error(
      'useAudioPlayerContext must be used within a AudioPlayerProvider',
    )
  }

  return audioPlayerContext
}
