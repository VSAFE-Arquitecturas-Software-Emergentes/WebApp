import { request } from '../../../shared/infrastructure/http-client';
import type { JourneyGateway } from '../application/journey-usecases';
import type { Journey } from '../domain/models';
export class HttpJourneys implements JourneyGateway {
  start(alternativeId: string, key: string) {
    return request<Journey>('/journeys', {
      method: 'POST',
      headers: { 'idempotency-key': key },
      body: JSON.stringify({ alternativeId }),
    });
  }
  get(id: string) {
    return request<Journey>(`/journeys/${id}`);
  }
  change(id: string, version: number, alternativeId: string) {
    return request<Journey>(`/journeys/${id}/route`, {
      method: 'PATCH',
      body: JSON.stringify({ expectedVersion: version, alternativeId }),
    });
  }
  async close(id: string) {
    await request(`/journeys/${id}`, { method: 'DELETE' });
  }
  async progress(id: string, data: Parameters<JourneyGateway['progress']>[1]) {
    await request(`/journeys/${id}/progress`, { method: 'PATCH', body: JSON.stringify(data) });
  }
  async ack(id: string, alertId: string) {
    await request(`/journeys/${id}/alerts/${alertId}/ack`, { method: 'POST' });
  }
}
