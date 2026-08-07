/**
 * Shared constants used across pages and admin panels.
 * Single source of truth — edit here, applies everywhere.
 */

import { Code2, Globe, Palette, Search, Wrench, Smartphone } from 'lucide-react';

// ---------------------------------------------------------------------------
// Hero background-position mapping
// ---------------------------------------------------------------------------

export type HeroPosition =
  | 'top-left' | 'top' | 'top-right'
  | 'left'     | 'center' | 'right'
  | 'bottom-left' | 'bottom' | 'bottom-right';

export type HeroType = 'gradient' | 'image' | 'video';

/** Maps a HeroPosition key to a CSS background-position / object-position value. */
export const POSITION_CSS: Record<HeroPosition, string> = {
  'top-left':     'top left',
  'top':          'top center',
  'top-right':    'top right',
  'left':         'center left',
  'center':       'center center',
  'right':        'center right',
  'bottom-left':  'bottom left',
  'bottom':       'bottom center',
  'bottom-right': 'bottom right',
};

/** Used in SettingsManager position picker UI. */
export const POSITION_OPTIONS: { value: HeroPosition; label: string }[] = [
  { value: 'top-left',     label: '↖' },
  { value: 'top',          label: '↑' },
  { value: 'top-right',    label: '↗' },
  { value: 'left',         label: '←' },
  { value: 'center',       label: '·' },
  { value: 'right',        label: '→' },
  { value: 'bottom-left',  label: '↙' },
  { value: 'bottom',       label: '↓' },
  { value: 'bottom-right', label: '↘' },
];

// ---------------------------------------------------------------------------
// Service icon map
// ---------------------------------------------------------------------------

/** Maps icon name strings (stored in DB) to Lucide React components. */
export const SERVICE_ICON_MAP: Record<string, React.ElementType> = {
  globe:      Globe,
  code:       Code2,
  palette:    Palette,
  search:     Search,
  wrench:     Wrench,
  smartphone: Smartphone,
};

// ---------------------------------------------------------------------------
// Site-wide constants
// ---------------------------------------------------------------------------

export const SITE_URL   = 'https://vividev.id';
export const SITE_NAME  = 'ViviDev.id';
export const WA_NUMBER  = '6285798112370';
export const SUPPORT_EMAIL = 'support@vividev.id';
