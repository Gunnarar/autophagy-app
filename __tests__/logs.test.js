import {
  inferFastsFromFoodLog,
  getUnifiedFastRecommendation,
  FASTING_PROGRAMS,
} from '../utils/logs';

describe('inferFastsFromFoodLog', () => {
  it('returns an empty list when no gaps exceed 24 hours', () => {
    const foodLog = [
      { id: 'a', time: '2025-01-01T08:00:00.000Z', type: 'meal' },
      { id: 'b', time: '2025-01-01T20:00:00.000Z', type: 'meal' },
    ];
    expect(inferFastsFromFoodLog(foodLog)).toEqual([]);
  });

  it('infers a fast when meals are more than 24 hours apart', () => {
    const foodLog = [
      { id: 'a', time: '2025-01-01T08:00:00.000Z', type: 'meal' },
      { id: 'b', time: '2025-01-02T10:30:00.000Z', type: 'meal' },
    ];
    const [fast] = inferFastsFromFoodLog(foodLog);
    expect(fast).toMatchObject({
      method: 'inferred',
      start: '2025-01-01T08:00:00.000Z',
      end: '2025-01-02T10:30:00.000Z',
      breakType: 'meal',
    });
  });
});

describe('getUnifiedFastRecommendation', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(() => {
    jest.setSystemTime(new Date('2025-01-15T12:00:00.000Z'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  const baseAutophagyStatus = { nextChallenge: 120 };

  const baseFoodLog = [
    { id: 'meal-1', time: '2025-01-14T18:00:00.000Z', type: 'animalMeat' },
    { id: 'meal-2', time: '2025-01-13T18:00:00.000Z', type: 'animalMeat' },
    { id: 'meal-3', time: '2025-01-12T18:00:00.000Z', type: 'animalMeat' },
  ];

  it('promotes the next fasting program when recent history supports it', () => {
    const fastLog = [
      {
        start: '2025-01-02T08:00:00.000Z',
        end: '2025-01-05T08:00:00.000Z', // 72 hours
      },
    ];

    const result = getUnifiedFastRecommendation(fastLog, baseFoodLog, [], baseAutophagyStatus);
    expect(result.recommendedProgram.key).toBe('96h');
    expect(result.caution).toBe(false);
    expect(result.reason).toContain('96h fast');
    expect(result.planNextMsg).toContain('plan your next multi-day fast');
    expect(result.challengeMsg).toContain('next autophagy challenge');
  });

  it('falls back to 24h when carb meals exceed the limit', () => {
    const foodLog = [
      { id: 'meal-1', time: '2025-01-14T18:00:00.000Z', type: 'meal', isCarb: true },
      { id: 'meal-2', time: '2025-01-13T18:00:00.000Z', type: 'meal', isCarb: true },
      { id: 'meal-3', time: '2025-01-12T18:00:00.000Z', type: 'meal', isCarb: true },
    ];
    const fastLog = [
      {
        start: '2024-12-15T08:00:00.000Z',
        end: '2024-12-17T08:00:00.000Z',
      },
    ];

    const result = getUnifiedFastRecommendation(fastLog, foodLog, [], baseAutophagyStatus);
    expect(result.recommendedProgram.key).toBe(FASTING_PROGRAMS[0].key);
    expect(result.caution).toBe(true);
    expect(result.reason).toContain('carb meals');
  });

  it('enforces a refeed period after a prolonged fast', () => {
    const fastLog = [
      {
        start: '2025-01-11T06:00:00.000Z',
        end: '2025-01-14T06:00:00.000Z', // 72 hours ending 1 day before "now"
      },
    ];

    const symptomLog = [
      { id: 'symptom-1', time: '2025-01-14T10:00:00.000Z', type: 'fatigue' },
    ];

    const result = getUnifiedFastRecommendation(
      fastLog,
      baseFoodLog,
      symptomLog,
      baseAutophagyStatus
    );

    expect(result.recommendedProgram.key).toBe(FASTING_PROGRAMS[0].key);
    expect(result.caution).toBe(true);
    expect(result.reason).toContain('refeed');
    expect(result.whatToExpect).toContain('Monitor your symptoms');
  });
});
