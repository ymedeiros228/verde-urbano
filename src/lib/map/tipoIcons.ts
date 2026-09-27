import {
  TreePine,
  Square,
  Shovel,
  Flower2,
  MapPin,
  type LucideIcon,
} from 'lucide-react';
import type { TipoPonto } from '@/lib/map/terezina';

/** Ícones Lucide — legenda, covers e UI */
export const TIPO_ICON: Record<TipoPonto, LucideIcon> = {
  terreno_baldio: Square,
  praca: TreePine,
  canteiro: Shovel,
  lazer_infantil: Flower2,
  outro: MapPin,
};

/** Paths SVG (viewBox 0 0 24 24) — pins MapLibre */
export const TIPO_ICON_SVG: Record<TipoPonto, string> = {
  terreno_baldio:
    '<rect x="6" y="6" width="12" height="12" rx="1.5" fill="none" stroke="currentColor" stroke-width="2"/>',
  praca:
    '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M12 22v-7m0 0l-3-5 3-8 3 8-3 5zm-5 0h10M8 10l-2 2m12-2l2 2"/>',
  canteiro:
    '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M4 20l8-8m0 0l3 3m-3-3l3-3M14 6l4 4"/>',
  lazer_infantil:
    '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M12 7a2 2 0 100-4 2 2 0 000 4zm0 0v3m0 0c-2 0-4 1.5-4 4v6h8v-6c0-2.5-2-4-4-4z"/>',
  outro:
    '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M12 21s7-5.5 7-11a7 7 0 10-14 0c0 5.5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5" fill="none" stroke="currentColor" stroke-width="2"/>',
};
