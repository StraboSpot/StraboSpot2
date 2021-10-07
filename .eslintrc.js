module.exports = {
  root: true,
  extends: ['@react-native-community', 'plugin:import/errors', 'plugin:import/warnings'],
  plugins: ['import', 'react-hooks'],
  rules: {
    'prettier/prettier': 'off',
    'brace-style': ['error', 'stroustrup', {allowSingleLine: true}],
    curly: ['error', 'multi-line'],
    'jsx-quotes': ['error', 'prefer-single'],
    'operator-linebreak': ['error', 'before'],
    'import/order': [
      'error',
      {
        'groups': ['builtin', 'external', 'internal'],
        'pathGroups': [
          {
            'pattern': '{react,react-native}',
            'group': 'external',
            'position': 'before',
          },
        ],
        'pathGroupsExcludedImportTypes': ['react', 'react-native'],
        'newlines-between': 'always',
        'alphabetize': {
          'order': 'asc',
          'caseInsensitive': true,
        },
      },
    ],
    'react-hooks/rules-of-hooks': 'error', // Checks rules of Hooks
    'react-hooks/exhaustive-deps': 'warn', // Checks effect dependencies
  },
  settings: {
    'import/ignore': ['react-native'],
  },
};
