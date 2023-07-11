import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import loadVersion from 'vite-plugin-package-version'
import { createVuePlugin as vue } from 'vite-plugin-vue2'

// https://vitejs.dev/config/
export default ({ mode }) => {
  import.meta.env = {
    ...import.meta.env,
    ...loadEnv(mode, process.cwd(), ['VITE', 'npm_package'])
  }

  const port = import.meta.env.VITE_PORT || 3000
  const shouldUseHttps = !!import.meta.env.VITE_HTTPS

  return defineConfig({
    plugins: [vue(), loadVersion()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    build: {
      sourcemap: true
    },
    server: {
      port,
      hmr: {
        clientPort: shouldUseHttps ? 443 : 80
      }
    },
    preview: {
      port,
      strictPort: true
    },
    devSourcemap: true
  })
}
