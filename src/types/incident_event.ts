import moment from "moment";

export interface IncidentEvent {
  log: string;
  time: moment.Moment;
  user: string;
}
