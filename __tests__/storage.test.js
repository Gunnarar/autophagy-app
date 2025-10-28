import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadString, saveString, loadJSON, saveJSON, deleteItem } from '../utils/storage';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('storage helpers', () => {
  const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

  afterEach(() => {
    jest.clearAllMocks();
    warnSpy.mockReset();
  });

  afterAll(() => {
    warnSpy.mockRestore();
  });

  describe('loadString/saveString', () => {
    it('returns default when key is missing', async () => {
      AsyncStorage.getItem.mockResolvedValueOnce(null);
      await expect(loadString('missing', 'fallback')).resolves.toBe('fallback');
    });

    it('removes key when saving null', async () => {
      await saveString('nullable', null);
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('nullable');
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('loadJSON/saveJSON', () => {
    it('parses JSON payload', async () => {
      AsyncStorage.getItem.mockResolvedValueOnce('{"foo":1}');
      await expect(loadJSON('jsonKey', {})).resolves.toEqual({ foo: 1 });
    });

    it('returns default when JSON is invalid', async () => {
      AsyncStorage.getItem.mockResolvedValueOnce('{invalid');
      await expect(loadJSON('broken', { ok: false })).resolves.toEqual({ ok: false });
      expect(warnSpy).toHaveBeenCalled();
    });

    it('removes key when saving undefined', async () => {
      await saveJSON('gone', undefined);
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('gone');
    });
  });

  it('deleteItem proxies removeItem', async () => {
    await deleteItem('temp');
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('temp');
  });
});
