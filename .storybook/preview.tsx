import type { Decorator, Preview } from '@storybook/react-vite'
import { useEffect } from 'react'

import '../src/styles.css'
import { allModes } from './modes'

const withTheme: Decorator = (Story, context) => {
  const theme = context.globals.theme ?? 'light'
  // `layout: 'fullscreen'` (token/overview pages) precisa ocupar a área toda;
  // as demais histórias só envolvem o componente, sem esticar o fundo escuro.
  const fullscreen = context.parameters.layout === 'fullscreen'
  // A classe de tema também vai no <html>, para que portais (Dialog, Popover,
  // Tooltip…) que o Radix anexa ao document.body herdem o tema — caso contrário
  // sempre renderizariam em light, fora do wrapper abaixo.
  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    return () => root.classList.remove('dark')
  }, [theme])
  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <div
        className={
          fullscreen
            ? 'bg-background text-foreground min-h-screen p-6'
            : 'bg-background text-foreground rounded-lg p-6'
        }
      >
        <Story />
      </div>
    </div>
  )
}

export const decorators: Decorator[] = [withTheme]

export const globalTypes = {
  theme: {
    description: 'Tema do design system',
    toolbar: {
      title: 'Tema',
      icon: 'circlehollow',
      items: [
        { value: 'light', title: 'Light', icon: 'sun' },
        { value: 'dark', title: 'Dark', icon: 'moon' },
      ],
      dynamicTitle: true,
    },
  },
}

export const initialGlobals = {
  theme: 'dark',
}

const preview: Preview = {
  parameters: {
    // Ordena a sidebar por categoria; o que não estiver listado vai para o fim,
    // em ordem alfabética. As entradas internas ordenam as páginas do grupo.
    options: {
      storySort: {
        order: [
          'Design System',
          ['Introduction', 'Foundations', 'Colors', 'Typography'],
          'Layout',
          'Navigation',
          'Data Entry',
          'Data Display',
          'Feedback',
          'Overlays',
        ],
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: 'error',
    },
    // Chromatic captura cada story em light e dark (um snapshot por modo).
    chromatic: {
      modes: {
        light: allModes.light,
        dark: allModes.dark,
      },
    },
  },
}

export default preview
