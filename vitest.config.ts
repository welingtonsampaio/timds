import { resolve } from 'node:path'
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { playwright } from '@vitest/browser-playwright'
import { defineConfig } from 'vitest/config'

const alias = { '@': resolve(__dirname, 'src') }

export default defineConfig({
  resolve: { alias },
  test: {
    // Aggregated coverage across both projects.
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.stories.tsx',
        'src/**/*.test.tsx',
        'src/test/**',
        'src/index.ts',
        'src/vite-env.d.ts',
      ],
    },
    projects: [
      // 1) Classic unit tests (Testing Library + jsdom).
      {
        plugins: [react(), tailwindcss()],
        resolve: { alias },
        test: {
          name: 'unit',
          environment: 'jsdom',
          setupFiles: ['./src/test/setup.ts'],
          include: ['src/**/*.{test,spec}.{ts,tsx}'],
          css: true,
        },
      },
      // 2) Storybook stories run as tests in a real browser
      //    (smoke render of all + play functions). Single source of truth.
      {
        // tailwindcss() is required here: storybookTest does not inherit the plugins
        // from the root vite.config.ts, so without it the utility classes generate no
        // CSS in the test browser and addon-a11y validated contrast over an unstyled
        // DOM (false results). With the plugin, axe evaluates the real colors of each
        // story.
        plugins: [
          tailwindcss(),
          storybookTest({ configDir: resolve(__dirname, '.storybook') }),
        ],
        resolve: { alias },
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
})
