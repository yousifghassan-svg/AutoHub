import React, { useState } from 'react';
import { View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useI18n } from '../i18n/useI18n';
import type { AppLocale } from '../i18n/locales';
import { AppBar } from '../components/AppBar';
import { Badge } from '../components/Badge';
import { BottomNavigation } from '../components/BottomNavigation';
import { BottomSheet } from '../components/BottomSheet';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Chip } from '../components/Chip';
import { Dialog } from '../components/Dialog';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { Icon } from '../components/Icon';
import { Input } from '../components/Input';
import { Loading } from '../components/Loading';
import { Screen } from '../components/Screen';
import { Skeleton, SkeletonCard } from '../components/Skeleton';
import { Text } from '../components/Text';

/**
 * On-device / Storybook gallery for the design system.
 * No API calls — pure UI composition for review.
 */
export function DesignSystemGallery() {
  const theme = useTheme();
  const { t, locale, setLocale } = useI18n();
  const [nav, setNav] = useState('home');
  const [chip, setChip] = useState('cars');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const locales: AppLocale[] = ['ar', 'ku', 'en'];

  return (
    <Screen scroll>
      <View style={{ gap: theme.spacing.xl }}>
        <View style={{ gap: theme.spacing.sm }}>
          <Text variant="overline" color="brand">
            AUTOHUB · SPRINT 7
          </Text>
          <Text variant="display">Mobile Design System</Text>
          <Text variant="body" color="secondary">
            Reusable Expo components · light/dark · RTL · ar / ku / en
          </Text>
          <Text variant="caption" color="secondary">
            Breakpoint: {theme.isTablet ? 'tablet' : 'phone'} · gutter {theme.layout.gutter}px ·{' '}
            {theme.scheme}
          </Text>
        </View>

        <Section title="Theme & locale">
          <View style={{ flexDirection: theme.isRTL ? 'row-reverse' : 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
            <Button
              size="sm"
              variant={theme.scheme === 'light' ? 'primary' : 'secondary'}
              onPress={() => theme.setScheme('light')}
            >
              Light
            </Button>
            <Button
              size="sm"
              variant={theme.scheme === 'dark' ? 'primary' : 'secondary'}
              onPress={() => theme.setScheme('dark')}
            >
              Dark
            </Button>
            {locales.map((code) => (
              <Chip
                key={code}
                label={code.toUpperCase()}
                selected={locale === code}
                onPress={() => setLocale(code)}
              />
            ))}
          </View>
        </Section>

        <Section title="Typography">
          <Text variant="display">Display</Text>
          <Text variant="h1">Heading 1</Text>
          <Text variant="h2">Heading 2</Text>
          <Text variant="h3">Heading 3</Text>
          <Text variant="body">Body — marketplace copy for listings and filters.</Text>
          <Text variant="label">Label</Text>
          <Text variant="caption" color="secondary">
            Caption secondary
          </Text>
        </Section>

        <Section title="Buttons">
          <View style={{ flexDirection: theme.isRTL ? 'row-reverse' : 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
            <Button>{t('continue')}</Button>
            <Button variant="secondary">{t('save')}</Button>
            <Button variant="ghost">{t('cancel')}</Button>
            <Button variant="danger">Delete</Button>
            <Button loading>{t('loading')}</Button>
          </View>
        </Section>

        <Section title="Inputs">
          <Input label={t('search')} placeholder={t('search')} />
          <Input label="Price" placeholder="0" helperText="IQD" keyboardType="numeric" />
          <Input label="VIN" errorText="Invalid VIN" defaultValue="BAD" />
        </Section>

        <Section title="Cards · badges · chips · icons">
          <Card elevated>
            <View style={{ gap: theme.spacing.sm }}>
              <View style={{ flexDirection: theme.isRTL ? 'row-reverse' : 'row', gap: theme.spacing.sm, alignItems: 'center' }}>
                <Icon name="car-sport-outline" color={theme.colors.primary} />
                <Text variant="h3">2019 Toyota Camry</Text>
              </View>
              <Text variant="body" color="secondary">
                Baghdad · Automatic · 45,000 km
              </Text>
              <View style={{ flexDirection: theme.isRTL ? 'row-reverse' : 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
                <Badge tone="brand">Featured</Badge>
                <Badge tone="success">Verified</Badge>
                <Badge tone="warning">Reserved</Badge>
              </View>
            </View>
          </Card>
          <View style={{ flexDirection: theme.isRTL ? 'row-reverse' : 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
            {(['cars', 'plates', 'bikes'] as const).map((key) => (
              <Chip
                key={key}
                label={key}
                selected={chip === key}
                onPress={() => setChip(key)}
              />
            ))}
          </View>
        </Section>

        <Section title="App bar">
          <Card padded={false}>
            <AppBar
              title="AutoHub"
              subtitle={t('search')}
              leadingIcon={theme.isRTL ? 'chevron-forward' : 'chevron-back'}
              trailing={<Icon name="notifications-outline" />}
            />
          </Card>
        </Section>

        <Section title="Loading · skeletons">
          <Loading label={t('loading')} />
          <Skeleton height={12} />
          <SkeletonCard />
        </Section>

        <Section title="Empty · error">
          <EmptyState
            title={t('emptyTitle')}
            description={t('emptyBody')}
            actionLabel={t('search')}
            onAction={() => undefined}
          />
          <ErrorState
            title={t('errorTitle')}
            description={t('errorBody')}
            retryLabel={t('retry')}
            onRetry={() => undefined}
          />
        </Section>

        <Section title="Dialog · bottom sheet">
          <View style={{ flexDirection: theme.isRTL ? 'row-reverse' : 'row', gap: theme.spacing.sm }}>
            <Button onPress={() => setDialogOpen(true)}>Dialog</Button>
            <Button variant="secondary" onPress={() => setSheetOpen(true)}>
              Sheet
            </Button>
          </View>
        </Section>

        <Section title="Bottom navigation">
          <Card padded={false}>
            <BottomNavigation
              activeKey={nav}
              onChange={setNav}
              items={[
                { key: 'home', label: t('home'), icon: 'home-outline', iconActive: 'home' },
                { key: 'search', label: t('search'), icon: 'search-outline', iconActive: 'search' },
                { key: 'sell', label: t('sell'), icon: 'add-circle-outline', iconActive: 'add-circle' },
                { key: 'inbox', label: t('inbox'), icon: 'chatbubble-outline', iconActive: 'chatbubble' },
                { key: 'account', label: t('account'), icon: 'person-outline', iconActive: 'person' },
              ]}
            />
          </Card>
        </Section>
      </View>

      <Dialog
        visible={dialogOpen}
        title={t('save')}
        message={t('emptyBody')}
        confirmLabel={t('continue')}
        cancelLabel={t('cancel')}
        onConfirm={() => setDialogOpen(false)}
        onCancel={() => setDialogOpen(false)}
        onRequestClose={() => setDialogOpen(false)}
      />
      <BottomSheet visible={sheetOpen} title={t('search')} onClose={() => setSheetOpen(false)}>
        <Text variant="body" color="secondary">
          Filters and sort controls will live here in later sprints.
        </Text>
        <View style={{ marginTop: theme.spacing.lg }}>
          <Button fullWidth onPress={() => setSheetOpen(false)}>
            {t('close')}
          </Button>
        </View>
      </BottomSheet>
    </Screen>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <View style={{ gap: theme.spacing.md }}>
      <Text variant="h3">{title}</Text>
      {children}
    </View>
  );
}
