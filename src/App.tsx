import './App.css'
import { useKeyupPlaySound } from './hooks/useKeyupPlaySound'

function App() {
  const {
    isPlaying,
    setIsPlaying,
    keyupInputs,
    handleReset,
  } = useKeyupPlaySound()

  return (
    <div className="grid pic w-full h-screen bg-grlxs bg-cover text-black">
      <div>
        <button
          className="ring-1 ring-gray-600"
          onClick={handleReset}
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
          {keyupInputs.join('')}
        </div>
      </div>
    </div>
  )
}

export default App
