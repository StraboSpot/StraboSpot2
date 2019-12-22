module.exports = {
  root: true,
  extends: '@react-native-community',
  rules: {
    'prettier/prettier': 'off',
    'brace-style': ['error', 'stroustrup', {allowSingleLine: true}],
    curly: ['error', 'multi-line'],
    'jsx-quotes': ['error', 'prefer-single'],
  },
};
