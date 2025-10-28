try {
  const prettier = require('prettier');
  if (prettier && typeof prettier.resolveConfig === 'object' && typeof prettier.resolveConfig.sync !== 'function') {
    prettier.resolveConfig.sync = () => null;
  }
} catch (err) {
  // ignore if prettier is not available
}

module.exports = {
  root: true,
  extends: '@react-native-community/eslint-config',
  rules: {
    'react/react-in-jsx-scope': 'off',
    'prettier/prettier': 'off',
  },
};
