import React from 'react';
import { View } from 'react-native';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import { Text } from '../components/Text';
import { themeArgTypes, withTheme, type StoryArgs } from './meta';

const meta = {
  title: 'Design System/Card',
  component: Card,
  argTypes: themeArgTypes,
  decorators: [
    (Story: React.ComponentType, context: { args: StoryArgs }) =>
      withTheme(Story, context.args),
  ],
};

export default meta;

export const Elevated = {
  args: { scheme: 'light', locale: 'en' },
  render: () => (
    <View style={{ padding: 16 }}>
      <Card elevated>
        <Text variant="h3">Listing card</Text>
        <Text variant="body" color="secondary">
          Baghdad · 2019
        </Text>
        <View style={{ marginTop: 8 }}>
          <Badge tone="brand">Featured</Badge>
        </View>
      </Card>
    </View>
  ),
};
