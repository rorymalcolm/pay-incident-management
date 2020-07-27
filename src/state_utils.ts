import { IncidentState } from "./types/incident_state";
import { KnownBlock } from "@slack/types";
import {
  MdSection,
  Divider,
  Button,
  Actions,
} from "@slack-wrench/blocks";

export function warnOfStateInconsistencies(
  incidentState: IncidentState
): KnownBlock[] {
  let stateWarnings: KnownBlock[] = [
    MdSection("*pay-incident-management*"),
    Divider(),
  ];
  console.log(`Current state: ${incidentState}`)
  if (incidentState.commsLead === "") {
    stateWarnings.push(
      MdSection(
        "This incident has no comms lead, you should assign one and communicate with users."
      ),
      Actions([
        Button(":hand: Become Comms Lead", "commsLead", {
          value: "commsLead",
        }),
      ]),
      Divider()
    );
  }
  if ((incidentState.incidentLead === "")) {
    stateWarnings.push(
      MdSection(
        "This incident has no incident lead, you should assign one to coordinate the technical response."
      ),
      Actions([
        Button(":hand: Become Incident Lead", "incidentLead", {
          value: "incidentLead",
        }),
      ]),
      Divider()
    );
  }
  console.log(`state warnings: ${JSON.stringify(stateWarnings)}`)
  return stateWarnings.length !== 2 ? stateWarnings : null;
}
