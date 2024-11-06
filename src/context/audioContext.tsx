import { Dispatch, FC, SetStateAction, createContext, useState } from 'react'
import { tracks, Track } from '../data/tracks'

interface AudioPlayerContextType {
  currentTrack: Track
  setCurrentTrack: Dispatch<SetStateAction<Track>>
}

export const AudioPlayerContext = createContext<
  AudioPlayerContextType | null
>(null)

interface AudioPlayerProviderProps {
  children?: React.ReactNode
}

export const AudioPlayerProvider: FC<AudioPlayerProviderProps> = ({
  children,
}) => {
  const [currentTrack, setCurrentTrack] = useState<Track>(tracks[0])

  const contextValue = {
    currentTrack,
    setCurrentTrack,
  }

  return (
    <AudioPlayerContext.Provider value={contextValue}>
      {children}
    </AudioPlayerContext.Provider>
  )
}
