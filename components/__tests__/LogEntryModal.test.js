import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import LogEntryModal from '../LogEntryModal';
import { SYMPTOM_TYPES, SEVERITIES } from '../../utils/constants';

jest.mock('../../contexts/LocalizationContext', () => ({
  useTranslation: () => ({
    t: (_key, fallback, params) => {
      if (fallback && params) {
        return Object.keys(params).reduce((acc, paramKey) => acc.replace(`{${paramKey}}`, params[paramKey]), fallback);
      }
      return fallback;
    },
  }),
}));

const defaultProps = {
  visible: true,
  onCancel: jest.fn(),
};

describe('LogEntryModal', () => {
  it('saves meal entries with updated diet type and pounds', () => {
    const handleSave = jest.fn();
    const { getByText, getByPlaceholderText } = render(
      <LogEntryModal
        mode="meal"
        onSave={handleSave}
        initialValues={{ dietType: 'standard', time: new Date('2024-01-01T12:00:00Z') }}
        {...defaultProps}
      />
    );

    fireEvent.press(getByText('Animal'));
    fireEvent.changeText(getByPlaceholderText('e.g. 0.75'), '1.5');
    fireEvent.press(getByText('Save'));

    expect(handleSave).toHaveBeenCalledWith(
      expect.objectContaining({
        dietType: 'animal',
        pounds: '1.5',
      })
    );
  });

  it('saves symptom entries with newly selected type and severity', () => {
    const handleSave = jest.fn();
    const targetSymptom = SYMPTOM_TYPES.find(t => t.key === 'slowness') ?? SYMPTOM_TYPES[0];
    const targetSeverity = SEVERITIES.find(s => s.key === 'moderate') ?? SEVERITIES[0];

    const { getByText } = render(
      <LogEntryModal
        mode="symptom"
        onSave={handleSave}
        initialValues={{ type: 'tremor', severity: 'mild', time: new Date('2024-01-01T12:00:00Z') }}
        {...defaultProps}
      />
    );

    fireEvent.press(getByText(targetSymptom.label));
    fireEvent.press(getByText(targetSeverity.label));
    fireEvent.press(getByText('Save'));

    expect(handleSave).toHaveBeenCalledWith(
      expect.objectContaining({
        type: targetSymptom.key,
        severity: targetSeverity.key,
      })
    );
  });
});
