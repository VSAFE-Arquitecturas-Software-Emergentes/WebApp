export interface Point {
  lat: number;
  lng: number;
}
export interface Place extends Point {
  label: string;
  detail: string;
}
export interface RouteAlternative {
  id: string;
  label: string;
  geometry: { type: 'LineString'; coordinates: [number, number][] };
  distance: number;
  duration: number;
  demo: boolean;
  risk: {
    level: 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN';
    score: number | null;
    cause: string | null;
    coverage: number;
    sampleCount: number;
    methodVersion: string;
    validUntil: string;
    demo: boolean;
  };
}
export const places: Place[] = [
  { label: 'Parque Kennedy', detail: 'Miraflores', lat: -12.1211, lng: -77.0303 },
  { label: 'Parque del Amor', detail: 'Malecón Cisneros', lat: -12.1267, lng: -77.0369 },
  { label: 'Larcomar', detail: 'Malecón de la Reserva', lat: -12.1319, lng: -77.0305 },
  { label: 'Óvalo Gutiérrez', detail: 'Miraflores / San Isidro', lat: -12.1102, lng: -77.0375 },
  { label: 'Parque El Olivar', detail: 'San Isidro', lat: -12.0966, lng: -77.035 },
];
