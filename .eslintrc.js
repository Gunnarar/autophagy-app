module.exports = {
  root: true,
  extends: '@react-native-community/eslint-config',
  plugins: ['prettier'],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react-native/no-inline-styles': 'error',
    curly: 'off',
    'no-unused-vars': ['warn', { varsIgnorePattern: '^_', argsIgnorePattern: '^_' }],
    'prettier/prettier': 'off',
  },
};
