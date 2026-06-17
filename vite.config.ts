import { resolve } from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

// Storybook também carrega esta config; nesse caso não queremos o build
// em modo library nem a geração de tipos (.d.ts) — só os plugins de base.
const isStorybook = process.env.npm_lifecycle_event?.includes('storybook') ?? false

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    ...(isStorybook
      ? []
      : [
          dts({
            include: ['src'],
            exclude: ['src/**/*.stories.tsx', 'src/**/*.test.tsx', 'src/test/**'],
            entryRoot: resolve(__dirname, 'src'),
            tsconfigPath: './tsconfig.json',
          }),
        ]),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: isStorybook
    ? {}
    : {
        lib: {
          entry: resolve(__dirname, 'src/index.ts'),
          formats: ['es'],
          fileName: 'index',
          cssFileName: 'timds',
        },
        rollupOptions: {
          external: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
        },
      },
})
