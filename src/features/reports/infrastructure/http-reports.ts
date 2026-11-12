import { request } from '../../../shared/infrastructure/http-client';
import type { ReportsGateway } from '../application/report-usecases';
import type { ReportInput, Report, Audit } from '../domain/models';
export class HttpReports implements ReportsGateway {
  create(input: ReportInput, key: string) {
    return request<Report>('/incident-reports', {
      method: 'POST',
      body: JSON.stringify(input),
      headers: { 'idempotency-key': key },
    });
  }
  list() {
    return request<Report[]>('/incident-reports');
  }
  audit(id: string) {
    return request<Audit>(`/incident-reports/${id}/audit`);
  }
}
