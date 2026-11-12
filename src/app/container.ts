import { SearchRoutes } from '../features/planning/application/search-routes';
import { HttpPlanning } from '../features/planning/infrastructure/http-planning';
import { JourneyUseCases } from '../features/journeys/application/journey-usecases';
import { HttpJourneys } from '../features/journeys/infrastructure/http-journeys';
import { ReportUseCases } from '../features/reports/application/report-usecases';
import { HttpReports } from '../features/reports/infrastructure/http-reports';
// Composition root: concrete gateways are selected here, outside the use cases.
export const dependencies = {
  planning: new SearchRoutes(new HttpPlanning()),
  journeys: new JourneyUseCases(new HttpJourneys()),
  reports: new ReportUseCases(new HttpReports()),
};
