import { useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Button, Text, useTheme } from '@autohub/mobile-ui';
import type { CreateMediaItem } from '../domain/media';
import { newMediaId } from '../domain/media';

export function MediaStep({
  media,
  onChange,
  max = 12,
}: {
  media: CreateMediaItem[];
  onChange: (next: CreateMediaItem[]) => void;
  max?: number;
}) {
  const theme = useTheme();
  const [busy, setBusy] = useState(false);

  const addAssets = async (assets: ImagePicker.ImagePickerAsset[]) => {
    const prepared: CreateMediaItem[] = [];
    for (const [index, asset] of assets.entries()) {
      let uri = asset.uri;
      let mimeType = asset.mimeType ?? 'image/jpeg';
      let filename = asset.fileName ?? `photo_${Date.now()}_${index}.jpg`;
      try {
        const cropped = await ImageManipulator.manipulateAsync(
          asset.uri,
          [{ resize: { width: 1600 } }],
          { compress: 0.82, format: ImageManipulator.SaveFormat.JPEG },
        );
        uri = cropped.uri;
        mimeType = 'image/jpeg';
        filename = filename.replace(/\.\w+$/, '') + '.jpg';
      } catch {
        // keep original
      }
      prepared.push({
        localId: newMediaId() + String(index),
        kind: 'IMAGE',
        uri,
        mimeType,
        byteSize: asset.fileSize ?? 0,
        filename,
        uploadStatus: 'pending',
        progress: 0,
      });
    }
    onChange([...media, ...prepared].slice(0, max));
  };

  const addFromLibrary = async () => {
    setBusy(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 1,
        allowsEditing: true,
        selectionLimit: Math.max(1, max - media.length),
      });
      if (result.canceled) return;
      await addAssets(result.assets);
    } finally {
      setBusy(false);
    }
  };

  const takePhoto = async () => {
    setBusy(true);
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) return;
      const result = await ImagePicker.launchCameraAsync({
        quality: 1,
        allowsEditing: true,
      });
      if (result.canceled || !result.assets[0]) return;
      await addAssets(result.assets);
    } finally {
      setBusy(false);
    }
  };

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= media.length) return;
    const next = [...media];
    const tmp = next[index]!;
    next[index] = next[target]!;
    next[target] = tmp;
    onChange(next);
  };

  const retry = (localId: string) => {
    onChange(
      media.map((m) =>
        m.localId === localId
          ? { ...m, uploadStatus: 'pending', progress: 0, error: undefined }
          : m,
      ),
    );
  };

  return (
    <View style={{ gap: theme.spacing.md, flex: 1 }}>
      <Text variant="body" color="secondary">
        Take or pick photos. Images are cropped/resized and compressed before upload. Reorder with
        arrows; retry failed uploads.
      </Text>
      <View
        style={{
          flexDirection: theme.isRTL ? 'row-reverse' : 'row',
          gap: theme.spacing.sm,
        }}
      >
        <Button
          style={{ flex: 1 }}
          variant="secondary"
          disabled={busy || media.length >= max}
          onPress={() => void takePhoto()}
        >
          Take photo
        </Button>
        <Button
          style={{ flex: 1 }}
          disabled={busy || media.length >= max}
          onPress={() => void addFromLibrary()}
        >
          Gallery
        </Button>
      </View>
      {busy ? <ActivityIndicator color={theme.colors.primary} /> : null}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
          {media.map((item, index) => (
            <View key={item.localId} style={{ width: 120, gap: theme.spacing.xs }}>
              <Image
                source={{ uri: item.uri }}
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: theme.radii.md,
                  backgroundColor: theme.colors.surfaceMuted,
                }}
              />
              <Text variant="caption" color="secondary" numberOfLines={1}>
                {item.uploadStatus}
                {item.progress > 0 && item.progress < 1
                  ? ` · ${Math.round(item.progress * 100)}%`
                  : ''}
              </Text>
              {item.error ? (
                <Text variant="caption" color="error" numberOfLines={2}>
                  {item.error}
                </Text>
              ) : null}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
                <Pressable onPress={() => move(index, -1)}>
                  <Text variant="caption" color="brand">
                    ←
                  </Text>
                </Pressable>
                <Pressable onPress={() => move(index, 1)}>
                  <Text variant="caption" color="brand">
                    →
                  </Text>
                </Pressable>
                {item.uploadStatus === 'failed' ? (
                  <Pressable onPress={() => retry(item.localId)}>
                    <Text variant="caption" color="brand">
                      Retry
                    </Text>
                  </Pressable>
                ) : null}
                <Pressable
                  onPress={() => onChange(media.filter((m) => m.localId !== item.localId))}
                >
                  <Text variant="caption" color="error">
                    Delete
                  </Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
