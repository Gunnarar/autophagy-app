import { formatTimeHMS, formatTimeHM } from '../utils/constants';

describe('formatTime utilities', () => {
  it('formats hours, minutes, and seconds', () => {
    expect(formatTimeHMS(3661)).toBe('1h 1m 1s');
  });

  it('formats hours and minutes without seconds', () => {
    expect(formatTimeHM(5400)).toBe('1h 30m');
  });

  it('handles zero values consistently', () => {
    expect(formatTimeHMS(0)).toBe('0h 0m 0s');
    expect(formatTimeHM(0)).toBe('0h 0m');
  });
});
