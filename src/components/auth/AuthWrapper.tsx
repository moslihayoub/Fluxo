'use client';

import { useAuth } from './AuthProvider';
import LoginView from './LoginView';
import { Loader2 } from 'lucide-react';

import SyncManager from './SyncManager';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  return <SyncManager>{children}</SyncManager>;
}
