import React from 'react';
import { Text } from '@autohub/mobile-ui';
import { CATALOG_CATEGORIES } from '../../data/catalog';
import { useWizard } from '../../context/WizardProvider';
import { OptionGrid } from '../OptionGrid';

export function StepCategory() {
  const { draft, dispatch } = useWizard();
  return (
    <>
      <Text variant="body" color="secondary">
        What are you selling?
      </Text>
      <OptionGrid
        selectedId={draft.categoryId}
        options={CATALOG_CATEGORIES.map((c) => ({
          id: c.id,
          title: c.nameAr,
          subtitle: c.nameEn,
        }))}
        onSelect={(id) => {
          const cat = CATALOG_CATEGORIES.find((c) => c.id === id)!;
          dispatch({
            type: 'PATCH',
            patch: {
              categoryId: cat.id,
              categoryCode: cat.code,
              categoryLabel: cat.nameAr,
            },
          });
        }}
      />
    </>
  );
}
