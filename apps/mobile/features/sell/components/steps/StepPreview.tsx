import React from 'react';
import { ScrollView, View } from 'react-native';
import { Badge, Text, useTheme } from '@autohub/mobile-ui';
import { formatPrice } from '@/features/home/domain/mappers';
import { MediaGallery } from '@/features/listing-detail/components/MediaGallery';
import { SafetyTips } from '@/features/listing-detail/components/SafetyTips';
import { SellerCard } from '@/features/listing-detail/components/SellerCard';
import { SpecList } from '@/features/listing-detail/components/SpecRow';
import { draftToPreviewDetail } from '../../domain/preview-mapper';
import { useWizard } from '../../context/WizardProvider';

/** Preview uses the same section components as Listing Details. */
export function StepPreview() {
  const theme = useTheme();
  const { draft } = useWizard();
  const detail = draftToPreviewDetail(draft);

  return (
    <ScrollView contentContainerStyle={{ gap: theme.spacing.lg, paddingBottom: theme.spacing.xl }}>
      <Text variant="body" color="secondary">
        Preview — same layout as the public listing details screen.
      </Text>
      <View style={{ marginHorizontal: -theme.layout.gutter }}>
        <MediaGallery media={detail.media} onOpenFullScreen={() => undefined} />
      </View>
      <View style={{ gap: theme.spacing.sm }}>
        <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
          <Badge tone="warning">Draft preview</Badge>
        </View>
        <Text variant="h1">{detail.title}</Text>
        <Text variant="display" color="brand">
          {formatPrice(detail.price, detail.currencyCode)}
        </Text>
      </View>
      <Section title="Location">
        <Text variant="body">{detail.locationLabel}</Text>
      </Section>
      <Section title="Description">
        <Text variant="body" color="secondary">
          {detail.description}
        </Text>
      </Section>
      <Section title="Specifications">
        <SpecList rows={detail.specs} />
      </Section>
      <Section title="Seller">
        <SellerCard seller={detail.seller} />
      </Section>
      <SafetyTips />
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <View style={{ gap: theme.spacing.sm }}>
      <Text variant="h3">{title}</Text>
      {children}
    </View>
  );
}
