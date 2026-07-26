import { useCallback, useState } from 'react';
import { Alert, Linking, Share, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { AppBar, Button, Card, ErrorState, Loading, Text, useTheme } from '@autohub/mobile-ui';
import { OfflineBanner } from '@/features/auth/components/OfflineBanner';
import { safeBack } from '@/lib/navigation';
import { getDealersRepository } from '@/src/features/dealers/di';
import { getChatRepository } from '@/src/features/chat/di';
import { useStartDealerChat } from '@/src/features/chat/hooks/useChat';

export default function DealerProfileScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const startChat = useStartDealerChat();
  const [following, setFollowing] = useState(false);

  const dealer = useQuery({
    queryKey: ['dealer', id],
    queryFn: () => getDealersRepository().getById(id!),
    enabled: Boolean(id),
  });

  useQuery({
    queryKey: ['dealer-follow', id],
    queryFn: async () => {
      const res = await getChatRepository().isFollowingDealer(id!);
      setFollowing(res.following);
      return res;
    },
    enabled: Boolean(id),
  });

  const onChat = () => {
    if (!id) return;
    startChat.mutate(
      {
        organizationId: id,
        firstMessage: {
          type: 'DEALER_CARD',
          body: dealer.data?.name ?? 'Dealer inquiry',
          payload: { organizationId: id, name: dealer.data?.name },
        },
      },
      {
        onSuccess: (c) => router.push(`/inbox/${c.id}` as never),
        onError: (e) => Alert.alert('Chat', e instanceof Error ? e.message : 'Failed'),
      },
    );
  };

  const onCall = useCallback(() => {
    Alert.alert('Call', 'Phone number opens when the dealer publishes a contact number.');
  }, []);

  const onShare = useCallback(async () => {
    if (!dealer.data) return;
    await Share.share({ message: `${dealer.data.name} — AutoHub dealer` });
  }, [dealer.data]);

  const onFollow = async () => {
    if (!id) return;
    try {
      if (following) {
        await getChatRepository().unfollowDealer(id);
        setFollowing(false);
      } else {
        await getChatRepository().followDealer(id);
        setFollowing(true);
      }
    } catch (e) {
      Alert.alert('Follow', e instanceof Error ? e.message : 'Failed');
    }
  };

  if (dealer.isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <AppBar title="Dealer" leadingIcon="chevron-back" onLeadingPress={() => safeBack()} />
        <Loading label="Loading dealer…" />
      </View>
    );
  }

  if (dealer.isError || !dealer.data) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <AppBar title="Dealer" leadingIcon="chevron-back" onLeadingPress={() => safeBack()} />
        <ErrorState
          title="Dealer not found"
          retryLabel="Retry"
          onRetry={() => void dealer.refetch()}
        />
      </View>
    );
  }

  const d = dealer.data;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <AppBar
        title={d.name}
        leadingIcon={theme.isRTL ? 'chevron-forward' : 'chevron-back'}
        onLeadingPress={() => safeBack()}
      />
      <OfflineBanner />
      <View style={{ padding: theme.layout.gutter, gap: theme.spacing.lg }}>
        <Card>
          <View style={{ gap: theme.spacing.sm }}>
            <Text variant="h2">{d.name}</Text>
            <Text variant="body" color="secondary">
              {d.cityName ?? 'Iraq'} · {d.verified ? 'Verified dealer' : 'Dealer'}
            </Text>
            <Text variant="caption" color="secondary">
              {d.listingCount ?? 0} listings · followers shown on profile
            </Text>
          </View>
        </Card>

        <Button fullWidth loading={startChat.isPending} onPress={onChat}>
          Start Chat
        </Button>
        <Button fullWidth variant="secondary" onPress={onCall}>
          Call
        </Button>
        <Button fullWidth variant="secondary" onPress={() => void onShare()}>
          Share
        </Button>
        <Button fullWidth variant="ghost" onPress={() => void onFollow()}>
          {following ? 'Unfollow Dealer' : 'Follow Dealer'}
        </Button>
        <Button
          fullWidth
          variant="ghost"
          onPress={() => void Linking.openURL(`https://autohub.iq/dealers/${d.slug ?? d.id}`)}
        >
          Open web profile
        </Button>
      </View>
    </View>
  );
}
