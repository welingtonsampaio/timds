import type { Decorator, Preview } from '@storybook/react-vite'

import '../src/styles.css'
import { allModes } from './modes'

const withTheme: Decorator = (Story, context) => {
  const theme = context.globals.theme ?? 'light'
  // `layout: 'fullscreen'` (token/overview pages) precisa ocupar a área toda;
  // as demais histórias só envolvem o componente, sem esticar o fundo escuro.
  const fullscreen = context.parameters.layout === 'fullscreen'
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
