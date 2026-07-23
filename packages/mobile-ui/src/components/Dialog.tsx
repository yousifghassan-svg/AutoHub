import React from 'react';
import { Modal, Pressable, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Button } from './Button';
import { Text } from './Text';

export type DialogProps = {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  onRequestClose?: () => void;
};

export function Dialog({
  visible,
  title,
  message,
  confirmLabel = 'OK',
  cancelLabel,
  onConfirm,
  onCancel,
  onRequestClose,
}: DialogProps) {
  const theme = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onRequestClose}>
      <Pressable
        onPress={onRequestClose}
        style={{
          flex: 1,
          backgroundColor: theme.colors.overlay,
          justifyContent: 'center',
          padding: theme.layout.gutter,
        }}
      >
        <Pressable
          onPress={() => undefined}
          style={{
            backgroundColor: theme.colors.surface,
            borderRadius: theme.radii.lg,
            padding: theme.spacing.xl,
            gap: theme.spacing.md,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          <Text variant="h2">{title}</Text>
          {message ? (
            <Text variant="body" color="secondary">
              {message}
            </Text>
          ) : null}
          <View
            style={{
              flexDirection: theme.isRTL ? 'row-reverse' : 'row',
              gap: theme.spacing.sm,
              justifyContent: 'flex-end',
              marginTop: theme.spacing.sm,
            }}
          >
            {cancelLabel ? (
              <Button variant="ghost" onPress={onCancel ?? onRequestClose}>
                {cancelLabel}
              </Button>
            ) : null}
            <Button variant="primary" onPress={onConfirm ?? onRequestClose}>
              {confirmLabel}
            </Button>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
