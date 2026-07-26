import { Stack } from 'expo-router';

export default function SellLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="vehicle" />
      <Stack.Screen name="plate" />
      <Stack.Screen name="wizard" />
    </Stack>
  );
}
