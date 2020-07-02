import { IncidentEvent } from "./types/incident_event";

export function generateIncidentLog(events: IncidentEvent[]): string {
  return events
    .map(x => {
      return `${x.time.format("YYYY-MM-DD HH:MM")} - ${x.user} - ${x.log}`;
    })
    .reduce((x, y) => {
      return x + "\n" + y;
    });
}
