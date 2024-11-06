import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
// import { AudioPlayerProvider } from './context/audioContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* <AudioPlayerProvider> */}
    <App />
    {/* </AudioPlayerProvider> */}
  </StrictMode>,
)
