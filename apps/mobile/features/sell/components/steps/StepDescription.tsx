import React from 'react';
import { View } from 'react-native';
import { Input, Text, useTheme } from '@autohub/mobile-ui';
import { useWizard } from '../../context/WizardProvider';

export function StepDescription() {
  const theme = useTheme();
  const { draft, dispatch } = useWizard();

  return (
    <View style={{ gap: theme.spacing.md }}>
      <Text variant="body" color="secondary">
        Write a clear title and description (Arabic recommended).
      </Text>
      <Input
        label="Title"
        value={draft.title}
        onChangeText={(title) => dispatch({ type: 'PATCH', patch: { title } })}
        placeholder="تويوتا كامري 2019"
      />
      <Input
        label="Description"
        value={draft.description}
        onChangeText={(description) => dispatch({ type: 'PATCH', patch: { description } })}
        placeholder="حالة السيارة، الصيانة، الملاحظات…"
        multiline
        style={{ minHeight: 140, textAlignVertical: 'top' }}
      />
    </View>
  );
}
