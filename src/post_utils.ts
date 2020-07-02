import { IncidentState } from "./types/incident_state";
import {
  Blocks,
  MdSection,
  Divider,
  Actions,
  Button
} from "@slack-wrench/blocks";
import { KnownBlock } from "@slack/web-api";

export function getIncidentSummary(incidentState: IncidentState): KnownBlock[] {
  return Blocks([
    MdSection("*pay-incident-management*"),
    Divider(),
    incidentState.incidentTitle !== ""
      ? MdSection(`Current Incident: \"${incidentState.incidentTitle}\"`)
      : MdSection(`A new incident has been declared!`),
    Divider(),
    MdSection("*Incident Lead*"),
    incidentState.incidentLead !== ""
      ? MdSection(`The incident lead is <@${incidentState.incidentLead}>`)
      : Actions([
          Button(":hand: Become Incident Lead", "incidentLead", {
            value: "incidentLead"
          })
        ]),
    Divider(),
    MdSection("*Comms Lead*"),
    incidentState.commsLead !== ""
      ? MdSection(`The comms lead is <@${incidentState.commsLead}>`)
      : Actions([
          Button(":hand: Become Comms Lead", "commsLead", {
            value: "commsLead"
          })
        ])
  ]);
}
