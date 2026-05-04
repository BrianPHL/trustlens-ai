'use client'

import { Capacitor } from '@capacitor/core'
import { SplashScreen } from '@capacitor/splash-screen'
import { StatusBar, Style } from '@capacitor/status-bar'
import { Haptics, ImpactStyle } from '@capacitor/haptics'

export const isNativePlatform = () => {
  return Capacitor.isNativePlatform()
}

export const getPlatform = () => {
  return Capacitor.getPlatform()
}

export const isIOS = () => {
  return getPlatform() === 'ios'
}

export const isAndroid = () => {
  return getPlatform() === 'android'
}

export const isWeb = () => {
  return getPlatform() === 'web'
}

export const hideSplashScreen = async () => {
  if (isNativePlatform()) {
    await SplashScreen.hide({
      fadeOutDuration: 500
    })
  }
}

export const showSplashScreen = async () => {
  if (isNativePlatform()) {
    await SplashScreen.show({
      autoHide: false,
      fadeInDuration: 300,
      fadeOutDuration: 500,
      showDuration: 2000
    })
  }
}

export const setStatusBarStyle = async (style: 'light' | 'dark') => {
  if (isNativePlatform()) {
    await StatusBar.setStyle({
      style: style === 'light' ? Style.Light : Style.Dark
    })
  }
}

export const setStatusBarColor = async (color: string) => {
  if (isAndroid()) {
    await StatusBar.setBackgroundColor({ color })
  }
}

export const hapticFeedback = async (style: 'light' | 'medium' | 'heavy' = 'medium') => {
  if (isNativePlatform()) {
    const impactStyle = {
      light: ImpactStyle.Light,
      medium: ImpactStyle.Medium,
      heavy: ImpactStyle.Heavy
    }[style]
    
    await Haptics.impact({ style: impactStyle })
  }
}

export const hapticNotification = async (type: 'success' | 'warning' | 'error' = 'success') => {
  if (isNativePlatform()) {
    const notificationType = {
      success: 'SUCCESS' as const,
      warning: 'WARNING' as const,
      error: 'ERROR' as const
    }[type]
    
    await Haptics.notification({ type: notificationType })
  }
}
