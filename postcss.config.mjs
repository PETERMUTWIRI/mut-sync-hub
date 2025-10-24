export default {
  plugins: {
    'postcss-flexbugs-fixes': {},
    'postcss-preset-env': {
      autoprefixer: { flexbox: 'no-2009' },
      stage: 3,
      features: { 'custom-properties': false },
    },
    tailwindcss: {},   // ← add this line
    autoprefixer: {},  // ← add this line
  },
};