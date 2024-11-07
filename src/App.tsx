import './App.css'
import { useKeyupPlaySound } from './hooks/useKeyupPlaySound'

function App() {
  const {
    isPlaying,
    setIsPlaying,
    keyupInputs,
    setKeyupInputs,
  } = useKeyupPlaySound()

  return (
    <div className="grid pic container h-screen bg-grlxs">
      <div>
        <button
          className="ring-1 ring-gray-600"
          onClick={() => setKeyupInputs([])}
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
