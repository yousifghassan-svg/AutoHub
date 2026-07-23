import React from 'react';
import { View } from 'react-native';
import { Input } from '../components/Input';
import { themeArgTypes, withTheme, type StoryArgs } from './meta';

const meta = {
  title: 'Design System/Input',
  component: Input,
  argTypes: themeArgTypes,
  decorators: [
    (Story: React.ComponentType, context: { args: StoryArgs }) =>
      withTheme(Story, context.args),
  ],
};

export default meta;

export const Default = {
  args: { scheme: 'light', locale: 'en' },
  render: () => (
    <View style={{ gap: 16, padding: 16 }}>
      <Input label="Search" placeholder="Make, model…" />
      <Input label="Price" helperText="IQD" keyboardType="numeric" />
      <Input label="Email" errorText="Required" />
    </View>
  ),
};

export const DarkKurdish = {
  args: { scheme: 'dark', locale: 'ku' },
  render: () => (
    <View style={{ gap: 16, padding: 16 }}>
      <Input label="گەڕان" placeholder="گەڕان…" />
    </View>
  ),
};
