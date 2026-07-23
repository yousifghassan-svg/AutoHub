import React from 'react';
import { Text } from '@autohub/mobile-ui';
import { CATALOG_CITIES } from '../../data/catalog';
import { useWizard } from '../../context/WizardProvider';
import { OptionGrid } from '../OptionGrid';

export function StepLocation() {
  const { draft, dispatch } = useWizard();
  return (
    <>
      <Text variant="body" color="secondary">
        Where is the vehicle located?
      </Text>
      <OptionGrid
        selectedId={draft.cityId}
        options={CATALOG_CITIES.map((c) => ({
          id: c.id,
          title: c.nameAr,
          subtitle: c.nameEn,
        }))}
        onSelect={(id) => {
          const city = CATALOG_CITIES.find((c) => c.id === id)!;
          dispatch({
            type: 'PATCH',
            patch: { cityId: city.id, cityLabel: city.nameAr },
          });
        }}
      />
    </>
  );
}
