import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: '#111111',
        panel: '#1a1a1a',
        border: '#2a2a2a',
        muted: '#666666',
        accent: '#ffffff',
      },
    },
  },
  plugins: [],
}
export default config
