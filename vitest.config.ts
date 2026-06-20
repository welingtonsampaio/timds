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
    // Cobertura agregada de ambos os projects.
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
      // 1) Testes unitários clássicos (Testing Library + jsdom).
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
      // 2) Histórias do Storybook executadas como testes em browser real
      //    (smoke render de todas + play functions). Única fonte da verdade.
      {
        // tailwindcss() é necessário aqui: o storybookTest não herda os plugins
        // do vite.config.ts raiz, então sem ele as classes utilitárias não geram
        // CSS no browser de teste e o addon-a11y validava contraste sobre um DOM
        // sem estilo (falsos resultados). Com o plugin, o axe avalia as cores
        // reais de cada story.
        plugins: [tailwindcss(), storybookTest({ configDir: resolve(__dirname, '.storybook') })],
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
