import type { Demanda } from '@/lib/data/mock';

export function downloadDemandasGeoJSON(demandas: Demanda[]) {
  const fc = {
    type: 'FeatureCollection',
    features: demandas.map((d) => ({
      type: 'Feature',
      properties: {
        id: d.id,
        titulo: d.titulo,
        bairro: d.bairro,
        tipo: d.tipo,
        status: d.status,
        urgencia: d.urgencia,
        votos: d.votos,
        necessidades: d.necessidades,
      },
      geometry: {
        type: 'Point',
        coordinates: [d.lng, d.lat],
      },
    })),
  };

  const blob = new Blob([JSON.stringify(fc, null, 2)], {
    type: 'application/geo+json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'verde-urbano-teresina-demandas.geojson';
  a.click();
  URL.revokeObjectURL(url);
}
