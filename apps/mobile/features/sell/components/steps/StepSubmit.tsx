import React from 'react';
import { View } from 'react-native';
import { EmptyState, Text, useTheme } from '@autohub/mobile-ui';
import { useWizard } from '../../context/WizardProvider';

export function StepSubmit() {
  const theme = useTheme();
  const { draft, submitting } = useWizard();

  if (draft.status === 'pending' || draft.status === 'submitted') {
    return (
      <EmptyState
        icon="checkmark-circle-outline"
        title="Submitted for review"
        description={`Listing ${draft.listingId ?? draft.localId} is PENDING moderation.`}
      />
    );
  }

  return (
    <View style={{ gap: theme.spacing.md }}>
      <Text variant="h2">Ready to submit?</Text>
      <Text variant="body" color="secondary">
        We will create/update your DRAFT on the server, upload media, then set status to PENDING
        for review.
      </Text>
      {submitting ? (
        <Text variant="label" color="brand">
          Submitting…
        </Text>
      ) : null}
    </View>
  );
}
