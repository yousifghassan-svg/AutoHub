import React from 'react';
import { Modal, Pressable, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Text } from './Text';

export type BottomSheetProps = {
  visible: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
};

export function BottomSheet({ visible, title, onClose, children }: BottomSheetProps) {
  const theme = useTheme();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: theme.colors.overlay,
          justifyContent: 'flex-end',
        }}
      >
        <Pressable
          onPress={() => undefined}
          style={{
            backgroundColor: theme.colors.surface,
            borderTopLeftRadius: theme.radii.xl,
            borderTopRightRadius: theme.radii.xl,
            paddingHorizontal: theme.layout.gutter,
            paddingTop: theme.spacing.md,
            paddingBottom: theme.spacing.xxl,
            maxHeight: '80%',
            borderTopWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          <View
            style={{
              alignSelf: 'center',
              width: 40,
              height: 4,
              borderRadius: theme.radii.full,
              backgroundColor: theme.colors.borderStrong,
              marginBottom: theme.spacing.md,
            }}
          />
          {title ? (
            <Text variant="h3" style={{ marginBottom: theme.spacing.md }}>
              {title}
            </Text>
          ) : null}
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
