import { resolve } from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { esmExternalRequirePlugin } from 'rolldown/plugins'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

// Storybook também carrega esta config; nesse caso não queremos o build
// em modo library nem a geração de tipos (.d.ts) — só os plugins de base.
const isStorybook = process.env.npm_lifecycle_event?.includes('storybook') ?? false

// Externos do build em modo library (react fica como peer; builtins do Node).
const libExternal = [
  'react',
  'react-dom',
  'react/jsx-runtime',
  'react/jsx-dev-runtime',
  /^node:/,
]

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
          cssFileName: 'timds',
        },
        rollupOptions: {
          // Externalização via esmExternalRequirePlugin (não duplicar em `external`
          // de topo: com a duplicata o tratamento padrão tem precedência e emite
          // `__require('react')`, que LANÇA no browser). O plugin marca os módulos
          // como externos E converte os `require('react')` das deps CJS vendorizadas
          // (recharts, ariakit, react-redux, use-sync-external-store…) em `import` ESM.
          plugins: [esmExternalRequirePlugin({ external: libExternal })],
          output: {
            // Preserva a estrutura de módulos (um arquivo por componente) em vez de
            // um bundle único. Permite tree-shaking confiável no consumidor: importar
            // um único componente não arrasta a lib inteira nem deps não usadas
            // (recharts, sonner, vaul...). Ver ADR 0010.
            preserveModules: true,
            preserveModulesRoot: 'src',
            // Deps externas bundladas iriam para `node_modules/...`; o npm ignora
            // pastas com esse nome ao publicar. Renomeamos para `vendor/` para manter
            // o output publicável.
            entryFileNames: (chunkInfo) =>
              chunkInfo.name.includes('node_modules')
                ? `${chunkInfo.name.replace(/node_modules/g, 'vendor')}.js`
                : '[name].js',
          },
        },
      },
})
