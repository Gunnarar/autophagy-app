import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import NotificationCard from '../NotificationCard';
import { theme } from '../../utils/theme';

jest.mock('@expo/vector-icons', () => ({
  MaterialCommunityIcons: () => null,
}));

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

const baseNotification = {
  key: 'test-card',
  title: 'Hydration reminder',
  desc: 'Drink a glass of water to stay on track.',
  icon: 'water',
  color: theme.colors.info,
};

describe('NotificationCard', () => {
  it('renders title and description content', () => {
    const { getByText } = render(
      <NotificationCard notification={baseNotification} />,
    );

    expect(getByText('Hydration reminder')).toBeTruthy();
    expect(getByText('Drink a glass of water to stay on track.')).toBeTruthy();
  });

  it('invokes primary, secondary, and dismiss actions when provided', () => {
    const primaryAction = jest.fn();
    const secondaryAction = jest.fn();
    const dismissAction = jest.fn();

    const { getByText, getByLabelText } = render(
      <NotificationCard
        notification={{
          ...baseNotification,
          action: primaryAction,
          actionLabel: 'Log water',
          secondaryAction,
          secondaryLabel: 'Snooze',
          dismissible: true,
        }}
        onDismiss={dismissAction}
      />,
    );

    fireEvent.press(getByText('Log water'));
    expect(primaryAction).toHaveBeenCalledTimes(1);

    fireEvent.press(getByText('Snooze'));
    expect(secondaryAction).toHaveBeenCalledTimes(1);

    fireEvent.press(getByLabelText('Dismiss notification'));
    expect(dismissAction).toHaveBeenCalledTimes(1);
  });
});
