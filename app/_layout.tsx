import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { LanguageProvider } from '@/context/LanguageContext';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <LanguageProvider>
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding/language" />
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="auth/signup" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="patient/register" />
        <Stack.Screen name="patient/[id]" />
        <Stack.Screen name="patient/assessment" />
        <Stack.Screen name="ai/result" />
        <Stack.Screen name="ai/chatbot" />
        <Stack.Screen name="referral" />
        <Stack.Screen name="epds" />
        <Stack.Screen name="scan" />
        <Stack.Screen name="audit" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </LanguageProvider>
  );
}
