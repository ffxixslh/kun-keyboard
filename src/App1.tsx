import {
  useState,
} from 'react'
import './App.css'
import { useTypeSound } from './hooks/useTypedSound'

// const keyDownHandler = (key: string) => {
//   switch (key) {
//     case 'c':
//       return '唱'
//
//     case 't':
//       return '跳'
//
//     case 'r':
//       return 'Rap'
//
//     case 'l':
//       return '篮球'
//
//     case 'm':
//       return 'Music'
//
//     case 'b':
//       return 'Baby'
//
//     case 'a':
//       return '哎哟'
//
//     case 'n':
//       return '你干嘛'
//
//     case 'g':
//       return '干嘛'
//
//     case ' ':
//       return '厉不厉害你坤哥'
//
//     default:
//       return ''
//   }
// }
//
function App() {
  // const [, setTrackFile] = useState<File | null>(null)
  // const [trackList, setTrackList] = useState<Track[]>(tracks)
  // const { currentTrack, setCurrentTrack } = useAudioPlayerContext()

  const [queueDisplay, setQueueDisplay] = useState<string[]>([])

  const { clearQueue } = useTypeSound({
    enabled: true,
    volume: 0.5,
    maxQueueSize: 10,
    defaultSoundUrl: '/src/assets/tracks/jntm.mp3',
    soundMap: {
      j: '/src/assets/tracks/jntm.mp3',
    },
    onQueueUpdate: (queue) => {
      setQueueDisplay(queue.map(ks => ks.key))
    },
  })

  // const handleSelect = useCallback((track: Track) => {
  //   setCurrentTrack(track)
  // }, [setCurrentTrack])
  //
  // const handleUpload = (e: ChangeEvent<HTMLInputElement>) => {
  //   const newFile = e.target.files?.length
  //     ? e.target.files[0]
  //     : null
  //   setTrackFile(newFile)
  //
  //   if (newFile) {
  //     const newTrack = {
  //       title: newFile.name,
  //       author: newFile.name,
  //       src: URL.createObjectURL(newFile),
  //     }
  //     setTrackList([...trackList, newTrack])
  //   }
  // }

  return (
    <div className="grid pic container h-screen">
      <div>
        <button
          className="ring-1 ring-gray-600"
          onClick={clearQueue}
        >
          Reset
        </button>
      </div>
      <div className="text-center">
        <div>
          queue:
          {queueDisplay.join('')}
        </div>
      </div>
      {/* <div className="flex flex-col gap-4"> */}
      {/*   <div> */}
      {/*     Current: */}
      {/*     {currentTrack.title} */}
      {/*   </div> */}
      {/*   <input */}
      {/*     type="file" */}
      {/*     onChange={e => handleUpload(e)} */}
      {/*   /> */}
      {/*   <div> */}
      {/*     TrackList: */}
      {/*     <ul> */}
      {/*       {trackList.map((track, index) => ( */}
      {/*         <li */}
      {/*           key={track.src} */}
      {/*           onClick={() => handleSelect(track)} */}
      {/*         > */}
      {/*           {index + 1} */}
      {/*           . */}
      {/*           {track.title} */}
      {/*         </li> */}
      {/*       ))} */}
      {/*     </ul> */}
      {/*   </div> */}
      {/* </div> */}
      {/* <AudioPlayer track={currentTrack} /> */}
    </div>
  )
}

export default App
