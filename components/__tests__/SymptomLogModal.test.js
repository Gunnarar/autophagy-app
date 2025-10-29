import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import SymptomLogModal from '../SymptomLogModal';
import { SYMPTOM_TYPES, SEVERITIES } from '../../utils/constants';

describe('SymptomLogModal', () => {
  const defaultProps = {
    visible: true,
    symptomType: SYMPTOM_TYPES[0].key,
    severity: SEVERITIES[0].key,
    note: '',
    time: new Date('2024-01-01T00:00:00Z'),
    isTimePickerVisible: false,
    onSelectSymptom: jest.fn(),
    onSelectSeverity: jest.fn(),
    onChangeNote: jest.fn(),
    onOpenTimePicker: jest.fn(),
    onCloseTimePicker: jest.fn(),
    onConfirmTime: jest.fn(),
    onSave: jest.fn(),
    onCancel: jest.fn(),
  };

  it('invokes symptom selector callback when a chip is pressed', () => {
    const onSelectSymptom = jest.fn();
    const targetSymptom = SYMPTOM_TYPES[1];
    const { getByText } = render(
      <SymptomLogModal {...defaultProps} onSelectSymptom={onSelectSymptom} />
    );

    fireEvent.press(getByText(targetSymptom.label));

    expect(onSelectSymptom).toHaveBeenCalledWith(targetSymptom.key);
  });

  it('invokes severity selector callback when a chip is pressed', () => {
    const onSelectSeverity = jest.fn();
    const targetSeverity = SEVERITIES[1];
    const { getByText } = render(
      <SymptomLogModal {...defaultProps} onSelectSeverity={onSelectSeverity} />
    );

    fireEvent.press(getByText(targetSeverity.label));

    expect(onSelectSeverity).toHaveBeenCalledWith(targetSeverity.key);
  });
});
