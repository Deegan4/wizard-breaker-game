import { useWindowDimensions } from 'react-native';

/** Width at which the app switches from the phone layout to the desktop web layout. */
export const WIDE_BREAKPOINT = 1024;

/** Max width of tab-screen content on wide screens, so lines stay readable. */
export const CONTENT_MAX_WIDTH = 960;

/** True on desktop-sized windows: sidebar nav instead of the bottom tab bar, two-column game screen. */
export function useWideLayout(): boolean {
  const { width } = useWindowDimensions();
  return width >= WIDE_BREAKPOINT;
}
