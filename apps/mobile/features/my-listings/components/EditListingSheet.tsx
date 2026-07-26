import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { BottomSheet, Button, Chip, Input, Text, useTheme } from '@autohub/mobile-ui';
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
  onSave: (input: {
    title: string;
    description: string;
    primaryPrice?: number;
    currencyCode?: 'IQD' | 'USD';
  }) => void;
}) {
  const theme = useTheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [currencyCode, setCurrencyCode] = useState<'IQD' | 'USD'>('IQD');

  useEffect(() => {
    if (!listing) return;
    setTitle(listing.title);
    setDescription(listing.description);
    setPrice(listing.price != null ? String(listing.price) : '');
    setCurrencyCode(listing.currencyCode === 'USD' ? 'USD' : 'IQD');
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
        <View style={{ flexDirection: theme.isRTL ? 'row-reverse' : 'row', gap: theme.spacing.sm }}>
          {(['IQD', 'USD'] as const).map((code) => (
            <Chip
              key={code}
              label={code}
              selected={currencyCode === code}
              onPress={() => setCurrencyCode(code)}
            />
          ))}
        </View>
        <Input
          label={`Price (${currencyCode})`}
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
              currencyCode,
            })
          }
        >
          Save changes
        </Button>
      </View>
    </BottomSheet>
  );
}
