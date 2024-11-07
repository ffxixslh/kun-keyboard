import {
  defineConfig,
} from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    port: 2500,
  },
  assetsInclude: ['**/*.mp3', '**/*.wav'],
})
