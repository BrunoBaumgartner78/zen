import type { Config } from 'tailwindcss'
export default {
content: [
'./src/app/**/*.{ts,tsx}',
'./src/components/**/*.{ts,tsx}',
],
theme: {
extend: {
colors: {
sand: '#e9e3d5',
stone: '#7a8f76',
ink: '#1b1b1b',
seal: '#a53a3a',
},
},
},
plugins: [],
} satisfies Config