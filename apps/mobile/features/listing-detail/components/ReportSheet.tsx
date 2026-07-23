import React, { useState } from 'react';
import { View } from 'react-native';
import { BottomSheet, Button, Chip, Text, useTheme } from '@autohub/mobile-ui';

const REASONS = [
  'Spam or misleading',
  'Wrong price',
  'Sold / unavailable',
  'Fraud suspicion',
  'Other',
];

export type ReportSheetProps = {
  visible: boolean;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
};

export function ReportSheet({ visible, loading, onClose, onSubmit }: ReportSheetProps) {
  const theme = useTheme();
  const [reason, setReason] = useState(REASONS[0]);

  return (
    <BottomSheet visible={visible} title="Report listing" onClose={onClose}>
      <View style={{ gap: theme.spacing.md }}>
        <Text variant="body" color="secondary">
          Reports are queued on device until a moderation API is available.
        </Text>
        <View
          style={{
            flexDirection: theme.isRTL ? 'row-reverse' : 'row',
            flexWrap: 'wrap',
            gap: theme.spacing.sm,
          }}
        >
          {REASONS.map((r) => (
            <Chip key={r} label={r} selected={reason === r} onPress={() => setReason(r)} />
          ))}
        </View>
        <Button fullWidth loading={loading} onPress={() => onSubmit(reason)}>
          Submit report
        </Button>
      </View>
    </BottomSheet>
  );
}
