import type { ReportInput, Report, Audit } from '../domain/models';
export interface ReportsGateway {
  create(input: ReportInput, key: string): Promise<Report>;
  list(): Promise<Report[]>;
  audit(id: string): Promise<Audit>;
}
export class ReportUseCases {
  constructor(public gateway: ReportsGateway) {}
  submit(input: ReportInput, key: string) {
    return this.gateway.create(input, key);
  }
}
