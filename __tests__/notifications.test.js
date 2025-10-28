import { createInfoNotifications } from '../utils/notifications';

describe('createInfoNotifications', () => {
  const baseArgs = {
    foodLog: [],
    symptomLog: [],
    fastLog: [],
    nextChallenge: null,
    currentLevel: 'Beginner',
    unifiedRec: null,
    today: '2025-01-15',
    fastingDismissedUntil: null,
    done: {},
    fastRecDismissed: false,
  };

  it('includes meal and symptom reminders when data is empty', () => {
    const notifications = createInfoNotifications(baseArgs);
    const keys = notifications.map(n => n.key);
    expect(keys).toContain('no-meal');
    expect(keys).toContain('no-symptom');
  });

  it('omits meal reminder when suppressed', () => {
    const notifications = createInfoNotifications({
      ...baseArgs,
      foodLog: [
        { id: '1', type: 'meal', time: '2025-01-15T08:00:00.000Z' },
      ],
      fastingDismissedUntil: Date.now() + 3600 * 1000,
    });
    const keys = notifications.map(n => n.key);
    expect(keys).not.toContain('no-meal');
  });

  it('adds unified fast recommendation when available', () => {
    const notifications = createInfoNotifications({
      ...baseArgs,
      unifiedRec: {
        recommendedProgram: { duration: 24 },
        reason: 'Test reason',
        benefits: 'Benefits',
        whatToExpect: 'Expect',
        challengeMsg: 'Challenge',
        caution: false,
      },
    });
    expect(notifications[0].key).toBe('unified-fast-recommendation');
  });

  it('excludes unified fast recommendation when dismissed', () => {
    const notifications = createInfoNotifications({
      ...baseArgs,
      unifiedRec: {
        recommendedProgram: { duration: 24 },
        reason: 'Test reason',
        benefits: 'Benefits',
        whatToExpect: 'Expect',
        challengeMsg: 'Challenge',
        caution: false,
      },
      fastRecDismissed: true,
    });
    const keys = notifications.map(n => n.key);
    expect(keys).not.toContain('unified-fast-recommendation');
  });

  it('includes recommendation cards when not marked done', () => {
    const notifications = createInfoNotifications(baseArgs);
    const keys = notifications.map(n => n.key);
    expect(keys).toContain('rec-meditation');
    expect(keys).toContain('rec-exercise');
    expect(keys).toContain('rec-hydration');
  });

  it('omits recommendation cards when marked done', () => {
    const notifications = createInfoNotifications({
      ...baseArgs,
      done: {
        'meditation-2025-01-15': true,
        'exercise-2025-01-15': true,
        'hydration-2025-01-15': true,
      },
    });
    const keys = notifications.map(n => n.key);
    expect(keys).not.toContain('rec-meditation');
    expect(keys).not.toContain('rec-exercise');
    expect(keys).not.toContain('rec-hydration');
  });
});
