import { IncidentEvent } from "./incident_event";

export interface IncidentState {
  incidentLead: string;
  commsLead: string;
  incidentTitle: string;
  priority?: number;
  eventLog?: IncidentEvent[];
}
