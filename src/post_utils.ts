import { IncidentState } from "./types/incident_state";
import {
  Blocks,
  MdSection,
  Divider,
  Actions,
  Button,
} from "@slack-wrench/blocks";
import { KnownBlock } from "@slack/web-api";

export function getIncidentSummary(incidentState: IncidentState): KnownBlock[] {
  return Blocks([
    MdSection("*pay-incident-management*"),
    Divider(),
    MdSection("*Title*"),
    incidentState.incidentTitle !== ""
      ? MdSection(`Title: \"${incidentState.incidentTitle}\"`)
      : MdSection(
          "This incident has no title, set one with ```\\incident title [title]```"
        ),
    Divider(),
    MdSection("*Priority*"),
    incidentState.priority
      ? MdSection(`P${incidentState.priority}`)
      : MdSection(
          "This incident has no priority, set one with ```\\incident priotity [priority]```"
        ),
    Divider(),
    MdSection("*Incident Lead*"),
    incidentState.incidentLead !== ""
      ? MdSection(`The incident lead is <@${incidentState.incidentLead}>`)
      : Actions([
          Button(":hand: Become Incident Lead", "incidentLead", {
            value: "incidentLead",
          }),
        ]),
    Divider(),
    MdSection("*Comms Lead*"),
    incidentState.commsLead !== ""
      ? MdSection(`The comms lead is <@${incidentState.commsLead}>`)
      : Actions([
          Button(":hand: Become Comms Lead", "commsLead", {
            value: "commsLead",
          }),
        ]),
  ]);
}

export function newIncident(incidentState: IncidentState): KnownBlock[] {
  return Blocks([
    MdSection("*pay-incident-management*"),
    Divider(),
    incidentState.incidentTitle !== ""
      ? MdSection(
          `A new incident \"${incidentState.incidentTitle}\" has been declared!`
        )
      : MdSection(`A new incident has been declared!`),
    Divider(),
    incidentState.priority
      ? MdSection(`Priority: ${incidentState.priority}`)
      : MdSection(
          "This incident has no priority, set one with ```\\incident priotity [priority]```"
        ),
    Divider(),
    MdSection("*Incident Lead*"),
    Actions([
      Button(":hand: Become Incident Lead", "incidentLead", {
        value: "incidentLead",
      }),
    ]),
    Divider(),
    MdSection("*Comms Lead*"),
    Actions([
      Button(":hand: Become Comms Lead", "commsLead", {
        value: "commslead",
      }),
    ]),
  ]);
}
