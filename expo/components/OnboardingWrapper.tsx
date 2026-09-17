import React, { useState, useEffect, useCallback } from 'react';
import { View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OnboardingOverlay from '@/components/OnboardingOverlay';

const ONBOARDING_STORAGE_KEY = 'wizard_breaker_onboarding_complete';

interface OnboardingWrapperProps {
  children: React.ReactNode;
}

export default function OnboardingWrapper({ children }: OnboardingWrapperProps) {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const checkOnboarding = useCallback(async () => {
    try {
      const completed = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
      if (completed !== 'true') {
        setShowOnboarding(true);
      }
    } catch (e) {
      console.log('Error checking onboarding:', e);
      setShowOnboarding(true);
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    checkOnboarding();
  }, [checkOnboarding]);

  const handleComplete = useCallback(async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
      setShowOnboarding(false);
    } catch (e) {
      console.log('Error completing onboarding:', e);
      setShowOnboarding(false);
    }
  }, []);

  if (isChecking) {
    return <View style={{ flex: 1 }} />;
  }

  return (
    <View style={{ flex: 1 }}>
      {children}
      <OnboardingOverlay visible={showOnboarding} onComplete={handleComplete} />
    </View>
  );
}