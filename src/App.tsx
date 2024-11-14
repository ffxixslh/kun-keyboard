import KeyboardReact from 'react-simple-keyboard'
import { useKeyupPlaySound } from './hooks/useKeyupPlaySound'
import './App.css'
import 'react-simple-keyboard/build/css/index.css'
import { KEYBOARD_DISPLAY, KEYBOARD_LAYOUT } from './constants/keyboard'

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
            buttonTheme={[
              { class: 'grlxs', buttons: 'G g' },
              { class: 'hg-orange', buttons: 'L l' },
              { class: 'hg-purple', buttons: '{space}' },
              { class: 'hg-cyan', buttons: '{ctrl}' },
              {
                class: 'hg-white',
                buttons: 'A C G H J M N Q T R a c g h j m n q r t',
              },
            ]}
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
