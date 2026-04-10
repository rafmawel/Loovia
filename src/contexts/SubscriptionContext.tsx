'use client';

import { createContext, useContext } from 'react';
import type { Subscription } from '@/types';

interface SubscriptionContextValue {
  subscription: Subscription | null;
  isPro: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextValue>({
  subscription: null,
  isPro: false,
});

export function SubscriptionProvider({
  subscription,
  children,
}: {
  subscription: Subscription | null;
  children: React.ReactNode;
}) {
  const isPro = (subscription?.plan === 'pro' || subscription?.plan === 'multi_sci') && subscription?.status === 'active';

  return (
    <SubscriptionContext.Provider value={{ subscription, isPro }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  return useContext(SubscriptionContext);
}
