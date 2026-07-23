import { useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  View,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Icon, Loading, Text } from '@autohub/mobile-ui';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useListingMedia } from '@/features/listing-detail/hooks/useListingDetail';
import { VideoPlayer } from '@/features/listing-detail/components/VideoPlayer';
import { Viewer360Placeholder } from '@/features/listing-detail/components/Viewer360Placeholder';
import { ZoomableImage } from '@/features/listing-detail/components/ZoomableImage';
import { safeBack } from '@/lib/navigation';

const WIDTH = Dimensions.get('window').width;

export default function FullScreenGalleryScreen() {
  const params = useLocalSearchParams<{ id: string; index?: string }>();
  const id = typeof params.id === 'string' ? params.id : '';
  const initial = Number(params.index ?? 0) || 0;
  const mediaQuery = useListingMedia(id);
  const [index, setIndex] = useState(initial);
  const listRef = useRef<FlatList>(null);

  const media = useMemo(() => mediaQuery.data ?? [], [mediaQuery.data]);

  if (mediaQuery.isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center' }}>
        <Loading label="Loading media…" />
      </View>
    );
  }

  const current = media[index];

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#000' }}>
      <StatusBar style="light" />
      <View
        style={{
          position: 'absolute',
          top: 48,
          left: 16,
          right: 16,
          zIndex: 2,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close gallery"
          onPress={() => safeBack(`/listing/${id}`)}
          hitSlop={12}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: 'rgba(0,0,0,0.45)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="close" color="#fff" />
        </Pressable>
        <Text variant="label" style={{ color: '#fff' }}>
          {media.length ? `${index + 1} / ${media.length}` : '0 / 0'}
          {current?.kind === 'VIDEO' ? ' · Video' : ''}
          {current?.kind === '360_MEDIA' ? ' · 360°' : ''}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        ref={listRef}
        data={media}
        horizontal
        pagingEnabled
        initialScrollIndex={Math.min(initial, Math.max(media.length - 1, 0))}
        getItemLayout={(_, i) => ({ length: WIDTH, offset: WIDTH * i, index: i })}
        showsHorizontalScrollIndicator={false}
        windowSize={3}
        maxToRenderPerBatch={2}
        keyExtractor={(item) => item.id}
        onScroll={(e: NativeSyntheticEvent<NativeScrollEvent>) => {
          setIndex(Math.round(e.nativeEvent.contentOffset.x / WIDTH));
        }}
        scrollEventThrottle={16}
        renderItem={({ item, index: itemIndex }) => (
          <View style={{ width: WIDTH, height: '100%' }}>
            {item.kind === 'VIDEO' ? (
              <VideoPlayer uri={item.url} isActive={itemIndex === index} />
            ) : item.kind === '360_MEDIA' ? (
              <Viewer360Placeholder />
            ) : (
              <ZoomableImage uri={item.url ?? item.thumbUrl} placeholderColor="#111" />
            )}
          </View>
        )}
      />
    </GestureHandlerRootView>
  );
}
