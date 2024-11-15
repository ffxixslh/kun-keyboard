import KeyboardReact from 'react-simple-keyboard'
import { useKeyupPlaySound } from './hooks/useKeyupPlaySound'
import './App.css'
import 'react-simple-keyboard/build/css/index.css'
import {
  KEYBOARD_DISPLAY,
  KEYBOARD_LAYOUT,
  KEYBOARD_BUTTON_THEME,
} from './constants/keyboard'

function App() {
  const {
    handleClick,
    handleReset,
  } = useKeyupPlaySound()

  return (
    <div className="grid pic w-full h-screen bg-grlxs bg-cover relative">
      <div
        className="absolute top-0 right-2 bg-chick"
      >
        <a
          className="underline text-blue-600 "
          href="https://github.com/ffxixslh/kun-keyboard"
        >
          repo
        </a>
      </div>
      <div>
        <button
          className="ring-1 p-1 bg-gray-800 text-white"
          onClick={handleReset}
        >
          Reset
        </button>
      </div>
      <div className="flex flex-col gap-2 items-center">
        <div className="container text-black xl:px-20">
          <KeyboardReact
            buttonTheme={KEYBOARD_BUTTON_THEME}
            layout={KEYBOARD_LAYOUT}
            display={KEYBOARD_DISPLAY}
            onKeyPress={handleClick}
          />
        </div>
      </div>
    </div>
  )
}

export default App
