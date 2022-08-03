module.exports = {
  root: true,
  env: {
    'browser': true,
    'es2021': true,
    'react-native/react-native': true,
  },
  extends: ['eslint:recommended', 'plugin:react/recommended', 'plugin:import/recommended'],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['react', 'react-hooks', 'react-native'],
  rules: {
    // Override default rules
    'arrow-parens': ['error', 'as-needed', {'requireForBlockBody': true}],
    'brace-style': ['error', 'stroustrup', {allowSingleLine: true}], // Prettier can't do this so don't use prettier
    'curly': ['error', 'multi-line'],
    'jsx-quotes': ['error', 'prefer-single'],
    'max-len': ['error', {
      'code': 120, 'tabWidth': 2, 'ignoreTrailingComments': true, 'ignoreUrls': true, 'ignoreRegExpLiterals': true,
    }],
    'object-curly-newline': ['error', {'consistent': true}],
    'operator-linebreak': ['error', 'before'],
    'quote-props': ['error', 'consistent'],
    'quotes': ['error', 'single'],

    // Override Import rules
    'import/order': ['error', {
      'groups': ['builtin', 'external', 'internal'],
      'pathGroups': [{pattern: '{react,react-native}', group: 'external', position: 'before'}],
      'pathGroupsExcludedImportTypes': ['react', 'react-native'],
      'newlines-between': 'always',
      'alphabetize': {order: 'asc', caseInsensitive: true},
    }],

    // Override React Native rules
    'react-native/no-inline-styles': 'off',

    // Override React rules
    'react/jsx-filename-extension': [1, {extensions: ['.js', '.jsx']}], // allow .js files to contain JSX code

    // Override React Hooks rules
    'react-hooks/rules-of-hooks': 'error', // Checks rules of Hooks
    'react-hooks/exhaustive-deps': 'warn', // Checks effect dependencies

    // Turn off rules
    'react/prop-types': 'off',
  },
  settings: {
    'import/ignore': ['react-native'],
  },
};
