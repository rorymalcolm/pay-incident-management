import { App, ExpressReceiver, LogLevel } from "@slack/bolt";
import { getIncidentSummary, newIncident, updateText } from "./post_utils";
import { IncidentState } from "./types/incident_state";
import { generateIncidentLog } from "./incident_log";
import moment from "moment";
import { MessageFetcher } from "./message_fetcher";

const DATE_FORMAT: string = "YYYY-MM-DD HH:MM";

let incidentState: IncidentState = {
  incidentStartTime: Date.now().toString(),
  commsLead: "",
  incidentLead: "",
  incidentTitle: "",
};

const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

const app = new App({
  token: process.env.SLACK_API_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  receiver,
  logLevel: LogLevel.DEBUG,
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
            text: "",
            channel: "govuk-pay-incident",
            blocks: updateText(
              `Incident title changed from \"${previousTitle}\" to \"${incidentState.incidentTitle}\"`
            ),
          });
        } else {
          say({
            icon_emoji: ":robot:",
            text: "",
            channel: "govuk-pay-incident",
            blocks: updateText(
              `Incident title set to \"${incidentState.incidentTitle}\"`
            ),
          });
        }
        break;
      case "summary":
        say({
          icon_emoji: ":robot:",
          text: "",
          channel: "govuk-pay-incident",
          blocks: getIncidentSummary(incidentState),
        });
        break;
      case "priority":
        incidentState.priority = parseInt(command.text.split(" ")[1]);
        say({
          icon_emoji: ":robot:",
          text: "",
          channel: "govuk-pay-incident",
          blocks: updateText(
            `Incident priority set to P${incidentState.priority}`
          ),
        });
        break;
      case "new":
        incidentState = {
          incidentStartTime: Date.now().toString(),
          commsLead: "",
          incidentLead: "",
          incidentTitle: "",
          eventLog: [],
        };
        if (command.text.split(" ").length >= 2) {
          incidentState.incidentTitle = command.text
            .split(" ")
            .slice(1, command.text.split("").length)
            .reduce((x, y) => {
              return x + " " + y;
            });
        }
        await say({
          icon_emoji: ":robot:",
          text: "",
          channel: "govuk-pay-incident",
          blocks: newIncident(incidentState),
        });
        break;
      case "report":
        let messageFetcher = new MessageFetcher(app, incidentState);
        let messages = await messageFetcher.getMessages();
        messages = messages.filter((x) => {
          return x.reactions.includes("memo");
        });
        const output = messages.map((x) => messageFetcher.parseMessage(x)).reverse().reduce((x,y) => `${x}\n${y}`);
        app.client.files.upload({
          token: process.env.SLACK_API_TOKEN,
          content: output,
          filename: `${moment().format(DATE_FORMAT)} - ${
            incidentState.incidentTitle
          }`,
          title: `${moment().format(DATE_FORMAT)} - ${
            incidentState.incidentTitle
          }`,
          filetype: "txt",
          channels: "govuk-pay-incident",
        });
        break;
    }
  }
});

app.action("commsLead", async ({ body, ack, context }) => {
  await ack();
  try {
    await app.client.chat.postMessage({
      token: process.env.SLACK_API_TOKEN,
      icon_emoji: ":robot:",
      text: `<@${body.user.name}> became the comms lead`,
      channel: "govuk-pay-incident",
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
      channel: "govuk-pay-incident",
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
