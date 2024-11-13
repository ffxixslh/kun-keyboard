import './App.css'
import { useKeyupPlaySound } from './hooks/useKeyupPlaySound'

function App() {
  const {
    isPlaying,
    keyupInputs,
    handleControl,
    handleInput,
    handleReset,
  } = useKeyupPlaySound()

  return (
    <div className="grid pic w-full h-screen bg-grlxs bg-cover text-black">
      <a
        className="absolute top-0 right-2 underline text-blue-600"
        href="https://github.com/ffxixslh/kun-keyboard"
      >
        repo
      </a>
      <div>
        <button
          className="ring-1 p-1 bg-gray-800 text-white"
          onClick={handleReset}
        >
          Reset
        </button>
      </div>
      <div className="flex flex-col gap-2 items-center">
        <button
          className="w-fit ring-1 p-1 rounded bg-[#9094EB] text-white"
          onClick={handleControl}
        >
          {isPlaying ? 'Stop' : 'Play'}
        </button>
        <input
          className="bg-white w-24"
          value={keyupInputs.join('')}
          onChange={handleInput}
        />
      </div>
    </div>
  )
}

export default App
