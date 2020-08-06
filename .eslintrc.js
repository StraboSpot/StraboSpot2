module.exports = {
  root: true,
  extends: ['@react-native-community', 'plugin:import/errors', 'plugin:import/warnings'],
  plugins: ['import'],
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
  },
  settings: {
    'import/ignore': ['react-native'],
  },
};
