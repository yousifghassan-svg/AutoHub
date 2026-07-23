import React from 'react';
import { Linking, Pressable, Share, View } from 'react-native';
import { Button, Icon, Text, useTheme, type IconName } from '@autohub/mobile-ui';
import type { ListingDetailModel } from '../domain/types';

export type ActionBarProps = {
  detail: ListingDetailModel;
  onFavorite: () => void;
  onReport: () => void;
};

function whatsappUrl(phone: string, text: string) {
  const digits = phone.replace(/\D/g, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export function ActionBar({ detail, onFavorite, onReport }: ActionBarProps) {
  const theme = useTheme();
  const phone = detail.seller.phone;
  const shareMessage = `${detail.title} — AutoHub\nautohub://listing/${detail.id}`;

  const onCall = () => {
    if (!phone) return;
    void Linking.openURL(`tel:${phone}`);
  };

  const onWhatsApp = () => {
    if (!phone) return;
    void Linking.openURL(whatsappUrl(phone, `Hi, I'm interested in: ${detail.title}`));
  };

  const onShare = async () => {
    await Share.share({ message: shareMessage, title: detail.title });
  };

  return (
    <View
      style={{
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
        paddingHorizontal: theme.layout.gutter,
        paddingVertical: theme.spacing.md,
        gap: theme.spacing.sm,
      }}
    >
      <View
        style={{
          flexDirection: theme.isRTL ? 'row-reverse' : 'row',
          gap: theme.spacing.sm,
        }}
      >
        <Button
          variant="primary"
          style={{ flex: 1 }}
          disabled={!phone}
          onPress={onCall}
        >
          Call seller
        </Button>
        <Button
          variant="secondary"
          style={{ flex: 1 }}
          disabled={!phone}
          onPress={onWhatsApp}
        >
          WhatsApp
        </Button>
      </View>
      <View
        style={{
          flexDirection: theme.isRTL ? 'row-reverse' : 'row',
          justifyContent: 'space-around',
          paddingTop: theme.spacing.xs,
        }}
      >
        <IconAction icon="heart-outline" label="Favorite" onPress={onFavorite} />
        <IconAction icon="share-outline" label="Share" onPress={() => void onShare()} />
        <IconAction icon="flag-outline" label="Report" onPress={onReport} />
      </View>
      {!phone ? (
        <Text variant="caption" color="secondary" align="center">
          Seller phone is not exposed by the listings API yet.
        </Text>
      ) : null}
    </View>
  );
}

function IconAction({
  icon,
  label,
  onPress,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable onPress={onPress} style={{ alignItems: 'center', gap: 4, minWidth: 72 }}>
      <Icon name={icon} color={theme.colors.text} />
      <Text variant="caption">{label}</Text>
    </Pressable>
  );
}
