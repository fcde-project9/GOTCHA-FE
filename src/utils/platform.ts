import { Capacitor } from "@capacitor/core";

/** 네이티브 앱(Capacitor)인지 여부 */
export function isNativeApp(): boolean {
  return Capacitor.isNativePlatform();
}

/** 현재 플랫폼 반환 ('ios' | 'android' | 'web') */
export function getPlatform(): string {
  return Capacitor.getPlatform();
}

/** iOS 네이티브 앱인지 여부 */
export function isIOS(): boolean {
  return Capacitor.getPlatform() === "ios";
}
