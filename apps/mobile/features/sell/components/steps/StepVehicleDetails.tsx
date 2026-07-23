import React from 'react';
import { View } from 'react-native';
import { Input, Text, useTheme } from '@autohub/mobile-ui';
import { useWizard } from '../../context/WizardProvider';

export function StepVehicleDetails() {
  const theme = useTheme();
  const { draft, dispatch } = useWizard();
  const skip =
    draft.categoryCode === 'PLATE' || draft.categoryCode === 'HEAVY_EQUIPMENT';

  if (skip) {
    return (
      <Text variant="body" color="secondary">
        Detailed specs for this category are not writable via the API yet. Continue to media.
      </Text>
    );
  }

  const vd = draft.vehicleDetails;
  const patch = (field: string, value: string) =>
    dispatch({
      type: 'PATCH',
      patch: { vehicleDetails: { ...vd, [field]: value } },
    });

  return (
    <View style={{ gap: theme.spacing.md }}>
      <Text variant="body" color="secondary">
        Year is required. Brand and model are optional labels for now (catalog API pending).
      </Text>
      <Input
        label="Year *"
        keyboardType="number-pad"
        maxLength={4}
        value={vd.year}
        onChangeText={(v) => patch('year', v)}
        placeholder="2019"
      />
      <Input
        label="Mileage (km)"
        keyboardType="number-pad"
        value={vd.mileageKm}
        onChangeText={(v) => patch('mileageKm', v)}
        placeholder="45000"
      />
      <Input
        label="Brand"
        value={vd.brandLabel}
        onChangeText={(v) => patch('brandLabel', v)}
        placeholder="Toyota"
      />
      <Input
        label="Model"
        value={vd.modelLabel}
        onChangeText={(v) => patch('modelLabel', v)}
        placeholder="Camry"
      />
      <Input
        label="Engine (cc)"
        keyboardType="number-pad"
        value={vd.engineSizeCc}
        onChangeText={(v) => patch('engineSizeCc', v)}
      />
      <Input
        label="Doors"
        keyboardType="number-pad"
        value={vd.doors}
        onChangeText={(v) => patch('doors', v)}
      />
    </View>
  );
}
