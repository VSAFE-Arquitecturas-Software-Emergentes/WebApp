import type { Point, RouteAlternative } from '../domain/models';
export interface PlanningGateway {
  search(
    origin: Point,
    destination: Point,
  ): Promise<{ routes: RouteAlternative[]; notice: string | null; demo: boolean }>;
}
export class SearchRoutes {
  constructor(private gateway: PlanningGateway) {}
  execute(origin: Point, destination: Point) {
    return this.gateway.search(origin, destination);
  }
}
