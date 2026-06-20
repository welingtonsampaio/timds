import { resolve } from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { esmExternalRequirePlugin } from 'rolldown/plugins'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

// Storybook also loads this config; in that case we don't want the library-mode
// build nor type generation (.d.ts) — only the base plugins.
const isStorybook = process.env.npm_lifecycle_event?.includes('storybook') ?? false

// Externals of the library-mode build (react stays as a peer; Node builtins).
const libExternal = [
  'react',
  'react-dom',
  'react/jsx-runtime',
  'react/jsx-dev-runtime',
  /^node:/,
]

// recharts is NOT bundled: the consumer composes the chart with recharts
// primitives (AreaChart, Pie…) and our `ChartContainer` uses `ResponsiveContainer`.
// If each side uses a different recharts instance, the React contexts don't
// match and the chart renders empty (no error). Keeping it external, there is a
// single instance (the consumer's; npm installs it as a transitive dep). Imported
// via ESM (not `require`), so the default `external` is enough — outside the plugin.
const libExternalEsm = ['recharts']

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
          // recharts external via the default `external` (see libExternalEsm).
          external: libExternalEsm,
          // react/react-dom: externalized via esmExternalRequirePlugin (do not duplicate
          // in the top-level `external` — with the duplicate the default handling takes
          // precedence and emits `__require('react')`, which THROWS in the browser). The
          // plugin marks them as external AND converts the `require('react')` calls of
          // vendored CJS deps (ariakit, react-redux, use-sync-external-store…) into ESM
          // `import`.
          plugins: [esmExternalRequirePlugin({ external: libExternal })],
          output: {
            // Preserves the module structure (one file per component) instead of a
            // single bundle. Enables reliable tree-shaking on the consumer side:
            // importing a single component doesn't drag in the whole lib nor unused
            // deps (recharts, sonner, vaul...). See ADR 0010.
            preserveModules: true,
            preserveModulesRoot: 'src',
            // Bundled external deps would go to `node_modules/...`; npm ignores
            // folders with that name when publishing. We rename them to `vendor/` to
            // keep the output publishable.
            entryFileNames: (chunkInfo) =>
              chunkInfo.name.includes('node_modules')
                ? `${chunkInfo.name.replace(/node_modules/g, 'vendor')}.js`
                : '[name].js',
          },
        },
      },
})
