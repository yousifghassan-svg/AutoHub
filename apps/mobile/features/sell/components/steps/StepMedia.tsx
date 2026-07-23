import React from 'react';
import { Alert, Image, Pressable, ScrollView, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Button, Icon, Text, useTheme } from '@autohub/mobile-ui';
import { useWizard } from '../../context/WizardProvider';
import type { MediaKind, WizardMediaItem } from '../../domain/types';

function makeItem(
  asset: ImagePicker.ImagePickerAsset,
  kind: MediaKind,
): WizardMediaItem {
  return {
    localId: `media-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    kind,
    uri: asset.uri,
    mimeType: asset.mimeType ?? (kind === 'VIDEO' ? 'video/mp4' : 'image/jpeg'),
    byteSize: asset.fileSize ?? 1,
    filename: asset.fileName ?? `${kind.toLowerCase()}-${Date.now()}.jpg`,
    uploadStatus: 'pending',
  };
}

export function StepMedia() {
  const theme = useTheme();
  const { draft, dispatch } = useWizard();

  const pick = async (kind: MediaKind) => {
    if (kind === '360_MEDIA') {
      Alert.alert(
        '360° placeholder',
        'Pick a cover image for now. Interactive 360 upload arrives later.',
      );
    }
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Allow photo library access to upload media.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes:
        kind === 'VIDEO'
          ? ImagePicker.MediaTypeOptions.Videos
          : ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      allowsMultipleSelection: kind === 'IMAGE',
      selectionLimit: kind === 'IMAGE' ? 6 : 1,
    });
    if (result.canceled) return;
    for (const asset of result.assets) {
      dispatch({
        type: 'ADD_MEDIA',
        item: makeItem(asset, kind === '360_MEDIA' ? '360_MEDIA' : kind),
      });
    }
  };

  return (
    <View style={{ gap: theme.spacing.md, flex: 1 }}>
      <Text variant="body" color="secondary">
        Add photos, an optional video, or a 360 placeholder cover.
      </Text>
      <View style={{ flexDirection: theme.isRTL ? 'row-reverse' : 'row', gap: theme.spacing.sm }}>
        <Button style={{ flex: 1 }} variant="secondary" onPress={() => void pick('IMAGE')}>
          Photos
        </Button>
        <Button style={{ flex: 1 }} variant="secondary" onPress={() => void pick('VIDEO')}>
          Video
        </Button>
        <Button style={{ flex: 1 }} variant="ghost" onPress={() => void pick('360_MEDIA')}>
          360°
        </Button>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
          {draft.media.map((m) => (
            <View key={m.localId} style={{ width: 110 }}>
              <Image
                source={{ uri: m.uri }}
                style={{
                  width: 110,
                  height: 110,
                  borderRadius: theme.radii.md,
                  backgroundColor: theme.colors.surfaceMuted,
                  opacity: m.uploadStatus === 'failed' ? 0.55 : 1,
                }}
              />
              <Text variant="caption" numberOfLines={1}>
                {m.uploadStatus === 'failed' ? 'Failed' : m.kind}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Remove media"
                onPress={() => dispatch({ type: 'REMOVE_MEDIA', localId: m.localId })}
              >
                <Icon name="trash-outline" color={theme.colors.error} size={18} />
              </Pressable>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
