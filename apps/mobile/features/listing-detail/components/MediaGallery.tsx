import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { Badge, Icon, Text, useTheme } from '@autohub/mobile-ui';
import type { ListingMediaItem } from '../domain/types';

const WIDTH = Dimensions.get('window').width;

export type MediaGalleryProps = {
  media: ListingMediaItem[];
  onOpenFullScreen: (index: number) => void;
};

export function MediaGallery({ media, onOpenFullScreen }: MediaGalleryProps) {
  const theme = useTheme();
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList>(null);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(e.nativeEvent.contentOffset.x / WIDTH);
    if (next !== index) setIndex(next);
  };

  if (!media.length) {
    return (
      <View
        style={{
          height: 280,
          backgroundColor: theme.colors.surfaceMuted,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name="image-outline" size={48} color={theme.colors.textSecondary} />
        <Text variant="body" color="secondary">
          No media
        </Text>
      </View>
    );
  }

  const current = media[index];

  return (
    <View>
      <FlatList
        ref={listRef}
        data={media}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onScroll={onScroll}
        scrollEventThrottle={16}
        renderItem={({ item, index: i }) => (
          <Pressable onPress={() => onOpenFullScreen(i)} style={{ width: WIDTH, height: 280 }}>
            {item.kind === 'IMAGE' || item.kind === '360_MEDIA' ? (
              <Image
                source={item.thumbUrl || item.url ? { uri: (item.thumbUrl ?? item.url)! } : undefined}
                style={{ width: '100%', height: '100%', backgroundColor: theme.colors.surfaceMuted }}
                contentFit="cover"
                cachePolicy="memory-disk"
                transition={200}
                recyclingKey={item.id}
              />
            ) : (
              <View
                style={{
                  flex: 1,
                  backgroundColor: theme.colors.surfaceMuted,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name="play-circle" size={56} color={theme.colors.primary} />
              </View>
            )}
            {item.kind === '360_MEDIA' ? (
              <View style={{ position: 'absolute', top: 12, left: 12 }}>
                <Badge tone="info">360°</Badge>
              </View>
            ) : null}
            {item.kind === 'VIDEO' ? (
              <View style={{ position: 'absolute', top: 12, left: 12 }}>
                <Badge tone="neutral">Video</Badge>
              </View>
            ) : null}
          </Pressable>
        )}
      />
      <View
        style={{
          position: 'absolute',
          bottom: 12,
          alignSelf: 'center',
          backgroundColor: theme.colors.overlay,
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.xs,
          borderRadius: theme.radii.full,
        }}
      >
        <Text variant="caption" style={{ color: theme.colors.textInverse }}>
          {index + 1} / {media.length}
          {current?.kind === '360_MEDIA' ? ' · 360' : ''}
          {current?.kind === 'VIDEO' ? ' · Video' : ''}
        </Text>
      </View>
    </View>
  );
}
