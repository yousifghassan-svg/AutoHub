import React from 'react';
import { View } from 'react-native';
import { Badge, Card, Icon, Text, useTheme } from '@autohub/mobile-ui';
import type { SellerCardModel } from '../domain/types';

export type SellerCardProps = {
  seller: SellerCardModel;
};

export function SellerCard({ seller }: SellerCardProps) {
  const theme = useTheme();

  return (
    <Card elevated>
      <View
        style={{
          flexDirection: theme.isRTL ? 'row-reverse' : 'row',
          gap: theme.spacing.md,
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: 52,
            height: 52,
            borderRadius: theme.radii.full,
            backgroundColor: theme.colors.primarySoft,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="person" size={26} color={theme.colors.primary} />
        </View>
        <View style={{ flex: 1, gap: 4, alignItems: theme.isRTL ? 'flex-end' : 'flex-start' }}>
          <View
            style={{
              flexDirection: theme.isRTL ? 'row-reverse' : 'row',
              gap: theme.spacing.sm,
              alignItems: 'center',
            }}
          >
            <Text variant="h3">{seller.displayName}</Text>
            {seller.verified ? <Badge tone="success">Verified</Badge> : null}
          </View>
          {seller.bio ? (
            <Text variant="caption" color="secondary">
              {seller.bio}
            </Text>
          ) : (
            <Text variant="caption" color="secondary">
              Private seller
            </Text>
          )}
          {!seller.phone ? (
            <Text variant="caption" color="secondary">
              Contact number not published on this API yet
            </Text>
          ) : null}
        </View>
      </View>
    </Card>
  );
}
