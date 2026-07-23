import React from 'react';
import { DesignSystemGallery } from '../gallery/DesignSystemGallery';
import { themeArgTypes, withTheme, type StoryArgs } from './meta';

const meta = {
  title: 'Design System/Gallery',
  component: DesignSystemGallery,
  argTypes: themeArgTypes,
  decorators: [
    (Story: React.ComponentType, context: { args: StoryArgs }) =>
      withTheme(Story, context.args),
  ],
};

export default meta;

export const FullGallery = {
  args: { scheme: 'light', locale: 'ar' },
  render: () => <DesignSystemGallery />,
};
