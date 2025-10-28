jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('HomeScreen module', () => {
  it('loads without throwing (ensures dependencies are defined)', () => {
    expect(() => require('../screens/HomeScreen')).not.toThrow();
  });
});
