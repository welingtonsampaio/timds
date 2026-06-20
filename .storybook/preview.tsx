import type { Decorator, Preview } from '@storybook/react-vite'
import { useEffect } from 'react'

import '../src/styles.css'
import { allModes } from './modes'

// The font (Inter) no longer comes from the distributed styles.css (see comment there).
// We load it here for Storybook (dev, Chromatic and the vitest-browser tests).
if (typeof document !== 'undefined' && !document.getElementById('timds-inter-font')) {
  const link = document.createElement('link')
  link.id = 'timds-inter-font'
  link.rel = 'stylesheet'
  link.href =
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'
  document.head.appendChild(link)
}

// Under the test runner (vitest browser), zero out animations/transitions. The
// enter/leave animations of the overlays (Radix + tw-animate-css) leave opacity 0 on
// the first frame and keep the node in the DOM during the fade-out, causing flakiness in
// `toBeVisible`/axe asserts. Does not affect Storybook dev or Chromatic.
if (import.meta.env.MODE === 'test' && typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = `*, *::before, *::after {
    animation-duration: 0s !important;
    animation-delay: 0s !important;
    transition-duration: 0s !important;
    transition-delay: 0s !important;
  }`
  document.head.appendChild(style)
}

const withTheme: Decorator = (Story, context) => {
  const theme = context.globals.theme ?? 'light'
  // `layout: 'fullscreen'` (token/overview pages) needs to occupy the whole area;
  // the other stories only wrap the component, without stretching the dark background.
  const fullscreen = context.parameters.layout === 'fullscreen'
  // The theme class also goes on the <html>, so that portals (Dialog, Popover,
  // Tooltip…) that Radix attaches to document.body inherit the theme — otherwise
  // they would always render in light, outside the wrapper below.
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
    description: 'Design system theme',
    toolbar: {
      title: 'Theme',
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
    // Sorts the sidebar by category; anything not listed goes to the end,
    // in alphabetical order. The nested entries order the pages within the group.
    options: {
      storySort: {
        order: [
          'Design System',
          [
            'Introduction',
            'Foundations',
            'Colors',
            'Typography',
            'Theming',
            'Accessibility',
          ],
          'Examples',
          [
            'Overview',
            'Login',
            'Sign Up',
            'Pricing',
            'Profile',
            'Notifications',
            'Settings',
            'Team',
            'Dashboard',
          ],
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
    // Chromatic captures each story in light and dark (one snapshot per mode).
    chromatic: {
      modes: {
        light: allModes.light,
        dark: allModes.dark,
      },
    },
  },
}

export default preview
