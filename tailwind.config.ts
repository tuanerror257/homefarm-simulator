import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg:      '#F5F0E8',
        bg2:     '#EDE8DC',
        surface: '#FAF7F2',
        ink:     '#1C1A16',
        ink2:    '#5A5855',
        ink3:    '#9A9895',
        rule:    '#DDD8CC',
        accent:  '#3D5A3E',
        red:     '#C8102E',
        'tag-kd-bg': '#EAF0EA',
        'tag-kd-c':  '#3D5A3E',
        'tag-ai-bg': '#FEF0E6',
        'tag-ai-c':  '#B85C1A',
        'tag-ls-bg': '#F3EDF8',
        'tag-ls-c':  '#7B4FA6',
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        sans:  ['var(--font-sans)', 'sans-serif'],
        mono:  ['var(--font-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
