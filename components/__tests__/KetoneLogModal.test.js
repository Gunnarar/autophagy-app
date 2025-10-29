import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import KetoneLogModal from '../KetoneLogModal';

describe('KetoneLogModal', () => {
  it('invokes the unit selector when a chip is tapped', () => {
    const handleSelectUnit = jest.fn();
    const { getByText } = render(
      <KetoneLogModal
        visible
        value="0.8"
        unit="mmol/L"
        time={new Date('2024-01-01T12:00:00Z')}
        note=""
        onChangeValue={jest.fn()}
        onSelectUnit={handleSelectUnit}
        onSetTimeToNow={jest.fn()}
        onChangeNote={jest.fn()}
        onSave={jest.fn()}
        onCancel={jest.fn()}
      />
    );

    fireEvent.press(getByText('mg/dL'));

    expect(handleSelectUnit).toHaveBeenCalledWith('mg/dL');
  });
});
