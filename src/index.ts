import { App, ExpressReceiver, LogLevel } from "@slack/bolt";
import {
  Blocks,
  MdSection,
  Divider,
  Actions,
  Button
} from "@slack-wrench/blocks";
import { getIncidentSummary } from "./post_utils";
import { IncidentState } from "./types/incident_state";

let incidentState: IncidentState = {
  commsLead: "",
  incidentLead: "",
  incidentTitle: ""
};

const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

const app = new App({
  token: process.env.SLACK_API_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  receiver,
  logLevel: LogLevel.DEBUG
});

app.command("/incident", async ({ command, ack, say }) => {
  await ack();

  if (command.text.split(" ")[0] !== "") {
    const action = command.text.split(" ")[0];
    switch (action) {
      case "title":
        const previousTitle = incidentState.incidentTitle;
        incidentState.incidentTitle = command.text
          .split(" ")
          .slice(1, command.text.split("").length)
          .reduce((x, y) => {
            return x + " " + y;
          });
        if (previousTitle !== "") {
          say({
            icon_emoji: ":robot:",
            text: `Incident title changed from \"${previousTitle}\" to \"${incidentState.incidentTitle}\"`,
            channel: "govuk-pay-incident"
          });
        } else {
          say({
            icon_emoji: ":robot:",
            text: `Incident title set to \"${incidentState.incidentTitle}\"`,
            channel: "govuk-pay-incident"
          });
        }
        break;
      case "summary":
        say({
          icon_emoji: ":robot:",
          text: "",
          channel: "govuk-pay-incident",
          blocks: getIncidentSummary(incidentState)
        });
        break;  
    }
  } else {
    await say({
      icon_emoji: ":robot:",
      text: "",
      channel: "govuk-pay-incident",
      blocks: Blocks([
        MdSection("*pay-incident-management*"),
        Divider(),
        incidentState.incidentTitle !== ""
          ? MdSection(
              `A new incident \"${incidentState.incidentTitle}\" has been declared!`
            )
          : MdSection(`A new incident has been declared!`),
        Divider(),
        MdSection("*Incident Lead*"),
        Actions([
          Button(":hand: Become Incident Lead", "incidentLead", {
            value: "incidentLead"
          })
        ]),
        Divider(),
        MdSection("*Comms Lead*"),
        Actions([
          Button(":hand: Become Comms Lead", "commsLead", {
            value: "commslead"
          })
        ])
      ])
    });
  }
});

app.action("commsLead", async ({ body, ack, context }) => {
  await ack();
  try {
    await app.client.chat.postMessage({
      token: process.env.SLACK_API_TOKEN,
      icon_emoji: ":robot:",
      text: `<@${body.user.name}> became the comms lead`,
      channel: "govuk-pay-incident"
    });
    incidentState.commsLead = body.user.name;
  } catch (error) {
    console.error(error);
  }
});

app.action("incidentLead", async ({ body, ack }) => {
  await ack();
  try {
    await app.client.chat.postMessage({
      token: process.env.SLACK_API_TOKEN,
      icon_emoji: ":robot:",
      text: `<@${body.user.name}> became the incident lead`,
      channel: "govuk-pay-incident"
    });
    incidentState.incidentLead = body.user.name;
  } catch (error) {
    console.error(error);
  }
});

receiver.router.get("/healthcheck", (_req, res) => {
  res.sendStatus(200);
});

(async () => {
  await app.start(8080);

  console.log("⚡️ Bolt app is running!");
})();
