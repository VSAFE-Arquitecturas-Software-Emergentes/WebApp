import type { Journey } from '../domain/models';
export interface JourneyGateway {
  start(alternativeId: string, key: string): Promise<Journey>;
  get(id: string): Promise<Journey>;
  change(id: string, version: number, alternativeId: string): Promise<Journey>;
  close(id: string): Promise<void>;
  progress(
    id: string,
    data: { routeVersion: number; segmentIndex: number; fractionAlong: number; observedAt: string },
  ): Promise<void>;
  ack(journeyId: string, alertId: string): Promise<void>;
}
export class JourneyUseCases {
  constructor(public readonly gateway: JourneyGateway) {}
  start(id: string, key: string) {
    return this.gateway.start(id, key);
  }
  change(journey: Journey, id: string) {
    return this.gateway.change(journey.id, journey.version, id);
  }
  close(journey: Journey) {
    return this.gateway.close(journey.id);
  }
}
