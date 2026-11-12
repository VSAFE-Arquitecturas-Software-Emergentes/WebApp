import { request } from '../../../shared/infrastructure/http-client';
import type { PlanningGateway } from '../application/search-routes';
import type { Point, RouteAlternative } from '../domain/models';
export class HttpPlanning implements PlanningGateway {
  search(origin: Point, destination: Point) {
    return request<{ routes: RouteAlternative[]; notice: string | null; demo: boolean }>(
      '/routes/search',
      {
        method: 'POST',
        body: JSON.stringify({
          origin: { lat: origin.lat, lng: origin.lng },
          destination: { lat: destination.lat, lng: destination.lng },
        }),
      },
    );
  }
}
