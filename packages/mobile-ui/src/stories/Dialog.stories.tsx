import React, { useState } from 'react';
import { View } from 'react-native';
import { BottomSheet } from '../components/BottomSheet';
import { Button } from '../components/Button';
import { Dialog } from '../components/Dialog';
import { Text } from '../components/Text';
import { themeArgTypes, withTheme, type StoryArgs } from './meta';

const meta = {
  title: 'Design System/Overlays',
  argTypes: themeArgTypes,
  decorators: [
    (Story: React.ComponentType, context: { args: StoryArgs }) =>
      withTheme(Story, context.args),
  ],
};

export default meta;

export const DialogAndSheet = {
  args: { scheme: 'light', locale: 'en' },
  render: () => {
    const [d, setD] = useState(false);
    const [s, setS] = useState(false);
    return (
      <View style={{ gap: 12, padding: 16 }}>
        <Button onPress={() => setD(true)}>Open dialog</Button>
        <Button variant="secondary" onPress={() => setS(true)}>
          Open sheet
        </Button>
        <Dialog
          visible={d}
          title="Confirm"
          message="Continue with this action?"
          confirmLabel="OK"
          cancelLabel="Cancel"
          onConfirm={() => setD(false)}
          onCancel={() => setD(false)}
          onRequestClose={() => setD(false)}
        />
        <BottomSheet visible={s} title="Filters" onClose={() => setS(false)}>
          <Text>Sheet content</Text>
        </BottomSheet>
      </View>
    );
  },
};
