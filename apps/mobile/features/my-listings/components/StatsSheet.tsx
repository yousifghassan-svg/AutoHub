import React from 'react';
import { View } from 'react-native';
import { BottomSheet, Text, useTheme } from '@autohub/mobile-ui';
import type { ManagedListing } from '../domain/types';

function StatRow({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: theme.isRTL ? 'row-reverse' : 'row',
        justifyContent: 'space-between',
        paddingVertical: theme.spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
      }}
    >
      <Text variant="body" color="secondary">
        {label}
      </Text>
      <Text variant="label">{value}</Text>
    </View>
  );
}

export function StatsSheet({
  listing,
  visible,
  onClose,
}: {
  listing: ManagedListing | null;
  visible: boolean;
  onClose: () => void;
}) {
  const theme = useTheme();
  if (!listing) return null;

  const dash = (n: number | null) => (n == null ? '—' : String(n));

  return (
    <BottomSheet visible={visible} title="Listing statistics" onClose={onClose}>
      <View style={{ gap: theme.spacing.sm }}>
        <Text variant="body" color="secondary">
          {listing.title}
        </Text>
        <StatRow label="Views" value={String(listing.stats.views)} />
        <StatRow label="Favorites" value={String(listing.stats.favorites)} />
        <StatRow label="Phone clicks" value={dash(listing.stats.phoneClicks)} />
        <StatRow label="WhatsApp clicks" value={dash(listing.stats.whatsappClicks)} />
        <StatRow label="Shares" value={dash(listing.stats.shares)} />
        <Text variant="caption" color="secondary">
          Phone, WhatsApp, and share counts are not exposed by the listings API yet.
        </Text>
      </View>
    </BottomSheet>
  );
}
