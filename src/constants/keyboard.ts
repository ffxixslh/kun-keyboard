export const KEYBOARD_DISPLAY = {
  '{bksp}': '⌫',
  '{enter}': '⏎',
  '{shift}': '⇧',
  '{tab}': '⇥',
  '{lock}': '⇪',
  '{space}': '▷‖',
  '{ctrl}': 'C.T.R.L.',
  'h': 'hh',
  'j': '🐔',
  'n': '🤣',
  't': '跳',
  'm': '🎶',
  'l': '🏀',
  'a': '哎哟',
  'c': '唱',
  'g': ' ',
  'q': '🤡',
  'r': 'rap',
}

export const KEYBOARD_LAYOUT = {
  default: [
    '` 1 2 3 4 5 6 7 8 9 0 - = {bksp}',
    '{tab} q w e r t y u i o p [ ] \\',
    '{lock} a s d f g h j k l ; \' {enter}',
    '{shift} z x c v b n m , . / {shift}',
    '{ctrl} {space}',
  ],
  shift: [
    '~ ! @ # $ % ^ & * ( ) _ + {bksp}',
    '{tab} Q W E R T Y U I O P { } |',
    '{lock} A S D F G H J K L : " {enter}',
    '{shift} Z X C V B N M < > ? {shift}',
    '{ctrl} {space}',
  ],
}

export const KEYBOARD_BUTTON_THEME = [
  { class: 'grlxs', buttons: 'G g' },
  { class: 'hg-orange', buttons: 'L l' },
  { class: 'hg-purple', buttons: '{space}' },
  { class: 'hg-cyan', buttons: '{ctrl}' },
  {
    class: 'hg-white',
    buttons: 'A C G H J M N Q R T a c g h j m n q r t',
  },
]

export const KEYBOARD_KEYMAP: Record<string, string> = {
  // 特殊功能键
  '{ctrl}': 'Control',
  '{shift}': 'Shift',
  '{alt}': 'Alt',
  '{meta}': 'Meta', // Windows键或Command键
  '{tab}': 'Tab',
  '{enter}': 'Enter',
  '{bksp}': 'Backspace',
  '{space}': ' ',
  '{del}': 'Delete',
  '{esc}': 'Escape',
  '{capslock}': 'CapsLock',

  // 方向键
  '{arrowup}': 'ArrowUp',
  '{arrowdown}': 'ArrowDown',
  '{arrowleft}': 'ArrowLeft',
  '{arrowright}': 'ArrowRight',

  // 功能键
  '{f1}': 'F1',
  '{f2}': 'F2',
  '{f3}': 'F3',
  '{f4}': 'F4',
  '{f5}': 'F5',
  '{f6}': 'F6',
  '{f7}': 'F7',
  '{f8}': 'F8',
  '{f9}': 'F9',
  '{f10}': 'F10',
  '{f11}': 'F11',
  '{f12}': 'F12',

  // 编辑键
  '{home}': 'Home',
  '{end}': 'End',
  '{pageup}': 'PageUp',
  '{pagedown}': 'PageDown',
  '{insert}': 'Insert',

  // 数字键盘
  '{numlock}': 'NumLock',
  '{numpaddivide}': '/',
  '{numpadmultiply}': '*',
  '{numpadsubtract}': '-',
  '{numpadadd}': '+',
  '{numpaddecimal}': '.',
  '{numpadenter}': 'Enter',
  '{numpad0}': '0',
  '{numpad1}': '1',
  '{numpad2}': '2',
  '{numpad3}': '3',
  '{numpad4}': '4',
  '{numpad5}': '5',
  '{numpad6}': '6',
  '{numpad7}': '7',
  '{numpad8}': '8',
  '{numpad9}': '9',

  // 符号键
  '{minus}': '-',
  '{equals}': '=',
  '{bracketleft}': '[',
  '{bracketright}': ']',
  '{backslash}': '\\',
  '{semicolon}': ';',
  '{quote}': '\'',
  '{backquote}': '`',
  '{comma}': ',',
  '{period}': '.',
  '{slash}': '/',

  // 组合键符号 (Shift + key)
  '{tilde}': '~',
  '{exclamation}': '!',
  '{at}': '@',
  '{hash}': '#',
  '{dollar}': '$',
  '{percent}': '%',
  '{caret}': '^',
  '{ampersand}': '&',
  '{asterisk}': '*',
  '{parenleft}': '(',
  '{parenright}': ')',
  '{underscore}': '_',
  '{plus}': '+',
  '{braceleft}': '{',
  '{braceright}': '}',
  '{pipe}': '|',
  '{colon}': ':',
  '{quotedbl}': '"',
  '{less}': '<',
  '{greater}': '>',
  '{question}': '?',
}

export const getKeyboardEventKey = (buttonKey: string): string => {
  return KEYBOARD_KEYMAP[buttonKey] || buttonKey
}
