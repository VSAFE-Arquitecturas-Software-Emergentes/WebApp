import type { Point } from '../../planning/domain/models';
export interface ReportInput {
  category: string;
  location: Point;
  observedAt: string;
  description: string;
}
export interface Report extends ReportInput {
  id: string;
  status: string;
  version: number;
  validUntil: string;
  demo: boolean;
}
export interface Audit {
  incidentId: string;
  versions: { version: number; status: string; transactionHash: string | null }[];
  scope: string;
  developmentNetwork: boolean;
}
