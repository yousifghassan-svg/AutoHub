import React, { useState } from 'react';
import { View } from 'react-native';
import { AppBar } from '../components/AppBar';
import { BottomNavigation } from '../components/BottomNavigation';
import { themeArgTypes, withTheme, type StoryArgs } from './meta';

const meta = {
  title: 'Design System/Navigation',
  argTypes: themeArgTypes,
  decorators: [
    (Story: React.ComponentType, context: { args: StoryArgs }) =>
      withTheme(Story, context.args),
  ],
};

export default meta;

export const AppBarAndTabs = {
  args: { scheme: 'light', locale: 'ar' },
  render: () => {
    const [key, setKey] = useState('home');
    return (
      <View>
        <AppBar title="AutoHub" subtitle="بحث" leadingIcon="chevron-forward" />
        <BottomNavigation
          activeKey={key}
          onChange={setKey}
          items={[
            { key: 'home', label: 'الرئيسية', icon: 'home-outline', iconActive: 'home' },
            { key: 'search', label: 'بحث', icon: 'search-outline', iconActive: 'search' },
            { key: 'sell', label: 'بيع', icon: 'add-circle-outline', iconActive: 'add-circle' },
          ]}
        />
      </View>
    );
  },
};
