import React from 'react';
import { View } from 'react-native';
import { Chip, Input, Text, useTheme } from '@autohub/mobile-ui';
import { MOCK_CURRENCY_IDS } from '../../data/catalog';
import { useWizard } from '../../context/WizardProvider';

export function StepPrice() {
  const theme = useTheme();
  const { draft, dispatch } = useWizard();

  return (
    <View style={{ gap: theme.spacing.md }}>
      <Text variant="body" color="secondary">
        Set your asking price.
      </Text>
      <View style={{ flexDirection: theme.isRTL ? 'row-reverse' : 'row', gap: theme.spacing.sm }}>
        {(['IQD', 'USD'] as const).map((code) => (
          <Chip
            key={code}
            label={code}
            selected={draft.currencyCode === code}
            onPress={() =>
              dispatch({
                type: 'PATCH',
                patch: {
                  currencyCode: code,
                  primaryCurrencyId: MOCK_CURRENCY_IDS[code],
                },
              })
            }
          />
        ))}
      </View>
      <Input
        label={`Price (${draft.currencyCode})`}
        keyboardType="numeric"
        value={draft.primaryPrice}
        onChangeText={(primaryPrice) => dispatch({ type: 'PATCH', patch: { primaryPrice } })}
        placeholder="18500000"
      />
    </View>
  );
}
