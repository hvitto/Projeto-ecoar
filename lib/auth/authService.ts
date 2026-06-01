import { config } from '@/lib/config'
import { apiAuthService, getAccessToken as getApiAccessToken } from './apiAuthService'
import { offlineDemoAuthService, getOfflineAccessToken } from './offlineDemoAuthService'

export const authService = config.OFFLINE_DEMO_MODE ? offlineDemoAuthService : apiAuthService

export function getAccessToken(): string | null {
  if (config.OFFLINE_DEMO_MODE) return getOfflineAccessToken()
  return getApiAccessToken()
}

export function isOfflineDemoMode(): boolean {
  return config.OFFLINE_DEMO_MODE
}
