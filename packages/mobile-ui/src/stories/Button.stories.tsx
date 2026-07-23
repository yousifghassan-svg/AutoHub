import React from 'react';
import { View } from 'react-native';
import { Button } from '../components/Button';
import { themeArgTypes, withTheme, type StoryArgs } from './meta';

const meta = {
  title: 'Design System/Button',
  component: Button,
  argTypes: themeArgTypes,
  decorators: [
    (Story: React.ComponentType, context: { args: StoryArgs }) =>
      withTheme(Story, context.args),
  ],
};

export default meta;

export const Primary = {
  args: { scheme: 'light', locale: 'en' },
  render: () => (
    <View style={{ gap: 12, padding: 16 }}>
      <Button>Continue</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Danger</Button>
      <Button loading>Loading</Button>
      <Button fullWidth>Full width</Button>
    </View>
  ),
};

export const ArabicRTL = {
  args: { scheme: 'light', locale: 'ar' },
  render: () => (
    <View style={{ gap: 12, padding: 16 }}>
      <Button>متابعة</Button>
      <Button variant="secondary">حفظ</Button>
    </View>
  ),
};
