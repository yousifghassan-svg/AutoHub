import React, { useEffect, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import { ResizeMode, Video } from 'expo-av';
import { Icon, Text, useTheme } from '@autohub/mobile-ui';

type VideoPlayerProps = {
  uri: string | null;
  /** Pause when the gallery page is not active. */
  isActive?: boolean;
};

export function VideoPlayer({ uri, isActive = true }: VideoPlayerProps) {
  const theme = useTheme();
  const ref = useRef<Video>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!isActive) {
      void ref.current?.pauseAsync();
      setPlaying(false);
    }
  }, [isActive]);

  if (!uri) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.colors.surfaceMuted,
          gap: theme.spacing.sm,
        }}
      >
        <Icon name="videocam-off-outline" size={40} color={theme.colors.textSecondary} />
        <Text variant="body" color="secondary">
          Video unavailable offline
        </Text>
      </View>
    );
  }

  if (!isActive) {
    return <View style={{ flex: 1, backgroundColor: '#000' }} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <Video
        ref={ref}
        style={{ flex: 1 }}
        source={{ uri }}
        useNativeControls
        resizeMode={ResizeMode.CONTAIN}
        onPlaybackStatusUpdate={(status) => {
          if (!status.isLoaded) return;
          setPlaying(status.isPlaying);
        }}
      />
      {!playing ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Play video"
          onPress={() => void ref.current?.playAsync()}
          style={{
            ...StyleSheetAbsolute,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="play-circle" size={64} color="#fff" />
        </Pressable>
      ) : null}
    </View>
  );
}

const StyleSheetAbsolute = {
  position: 'absolute' as const,
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
};
