module.exports = {
  root: true,
  extends: '@react-native-community/eslint-config',
  plugins: ['prettier'],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react-native/no-inline-styles': 'off',
    curly: 'off',
    'no-unused-vars': ['warn', { varsIgnorePattern: '^_', argsIgnorePattern: '^_' }],
    'prettier/prettier': 'off',
  },
  overrides: [
    {
      files: ['screens/LogsScreen.js'],
      rules: {
        'no-unused-vars': 'off',
        'no-shadow': 'off',
      },
    },
  ],
};
