import React from 'react';
import { Text } from '@autohub/mobile-ui';
import { CATALOG_VEHICLE_TYPES } from '../../data/catalog';
import { useWizard } from '../../context/WizardProvider';
import { OptionGrid } from '../OptionGrid';

export function StepVehicleType() {
  const { draft, dispatch } = useWizard();
  return (
    <>
      <Text variant="body" color="secondary">
        Condition / vehicle type for {draft.categoryLabel || 'your listing'}
      </Text>
      <OptionGrid
        selectedId={draft.conditionTypeId}
        options={CATALOG_VEHICLE_TYPES.map((t) => ({
          id: t.id,
          title: t.nameAr,
          subtitle: t.nameEn,
        }))}
        onSelect={(id) => {
          const t = CATALOG_VEHICLE_TYPES.find((x) => x.id === id)!;
          dispatch({
            type: 'PATCH',
            patch: {
              conditionTypeId: t.id,
              vehicleTypeCode: t.code,
              vehicleTypeLabel: t.nameAr,
            },
          });
        }}
      />
    </>
  );
}
