import React from 'react';
import { View } from 'react-native';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { Loading } from '../components/Loading';
import { SkeletonCard } from '../components/Skeleton';
import { themeArgTypes, withTheme, type StoryArgs } from './meta';

const meta = {
  title: 'Design System/States',
  argTypes: themeArgTypes,
  decorators: [
    (Story: React.ComponentType, context: { args: StoryArgs }) =>
      withTheme(Story, context.args),
  ],
};

export default meta;

export const AllStates = {
  args: { scheme: 'light', locale: 'en' },
  render: () => (
    <View style={{ gap: 24, padding: 16 }}>
      <Loading label="Loading…" />
      <SkeletonCard />
      <EmptyState title="Nothing here" description="Try another search." actionLabel="Search" onAction={() => undefined} />
      <ErrorState title="Error" description="Please retry." retryLabel="Retry" onRetry={() => undefined} />
    </View>
  ),
};
