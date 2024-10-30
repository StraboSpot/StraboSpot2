module.exports = {
  presets: ['module:@react-native/babel-preset'],
  env: {
    production: {
      plugins: ['transform-remove-console'],
    },
    development: {
      plugins: [['@babel/plugin-transform-react-jsx', { runtime: 'classic' }]],
    },
  },
  plugins: [
    '@babel/plugin-proposal-export-namespace-from',
    'react-native-reanimated/plugin',
  ],
};
