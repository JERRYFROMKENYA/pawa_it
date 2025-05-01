// eslint-disable-next-line @typescript-eslint/no-require-imports
const ripple = require('rippleui'); // Add this for correctness

module.exports = {
    content: [
        './app/**/*.{js,ts,jsx,tsx}',
        './components/**/*.{js,ts,jsx,tsx}',
        './node_modules/rippleui/**/*.js',
    ],
    theme: {
        extend: {},
    },
    plugins: [
        ripple, // Use the imported plugin
    ],
};