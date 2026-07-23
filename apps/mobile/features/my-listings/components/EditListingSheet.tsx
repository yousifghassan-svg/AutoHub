import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { BottomSheet, Button, Input, Text, useTheme } from '@autohub/mobile-ui';
import type { ManagedListing } from '../domain/types';

export function EditListingSheet({
  listing,
  visible,
  loading,
  onClose,
  onSave,
}: {
  listing: ManagedListing | null;
  visible: boolean;
  loading?: boolean;
  onClose: () => void;
  onSave: (input: { title: string; description: string; primaryPrice?: number }) => void;
}) {
  const theme = useTheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');

  useEffect(() => {
    if (!listing) return;
    setTitle(listing.title);
    setDescription(listing.description);
    setPrice(listing.price != null ? String(listing.price) : '');
  }, [listing]);

  if (!listing) return null;

  return (
    <BottomSheet visible={visible} title="Edit listing" onClose={onClose}>
      <View style={{ gap: theme.spacing.md }}>
        <Text variant="caption" color="secondary">
          Sold and archived listings cannot be edited on the API.
        </Text>
        <Input label="Title" value={title} onChangeText={setTitle} />
        <Input
          label="Description"
          value={description}
          onChangeText={setDescription}
          multiline
          style={{ minHeight: 100, textAlignVertical: 'top' }}
        />
        <Input
          label="Price"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
        />
        <Button
          fullWidth
          loading={loading}
          onPress={() =>
            onSave({
              title: title.trim(),
              description: description.trim(),
              primaryPrice: price ? Number(price) : undefined,
            })
          }
        >
          Save changes
        </Button>
      </View>
    </BottomSheet>
  );
}
