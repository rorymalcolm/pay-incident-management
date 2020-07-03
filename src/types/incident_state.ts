import { IncidentEvent } from "./incident_event";

export interface IncidentState {
  incidentStartTime: string;
  incidentLead: string;
  commsLead: string;
  incidentTitle: string;
  priority?: number;
  eventLog?: IncidentEvent[];
}
