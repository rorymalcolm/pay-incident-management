import express from "express";
import { WebClient } from "@slack/web-api";
import {
  Blocks,
  MdSection,
  Divider,
  Actions,
  Button
} from "@slack-wrench/blocks";
const app = express();
const token = process.env.SLACK_API_TOKEN;

app.use(express.urlencoded({ extended: true }));

const web = new WebClient(token);

app.get("/healthcheck", (req, res) => {
  res.sendStatus(200);
});

app.post("/buttons", async (req, res) => {
  const body = await req.body
  switch (body.payload.actions[0].action_id) {
    case "incidentLead":
      web.chat.postMessage({
        icon_emoji: ":robot:",
        channel: "govuk-pay-incident",
        text: "",
        blocks: Blocks([
          MdSection(
            `:hand: @${body.payload.user.username} became the Incident Lead`
          )
        ])
      });
    case "incidentLead":
      web.chat.postMessage({
        icon_emoji: ":robot:",
        channel: "govuk-pay-incident",
        text: "",
        blocks: Blocks([
          MdSection(
            `:hand: @${body.payload.user.username} became the Comms Lead`
          )
        ])
      });
  }
  res.sendStatus(200);
});

app.post("/incident", (req, res) => {
  web.chat.postMessage({
    icon_emoji: ":robot:",
    channel: "govuk-pay-incident",
    text: "",
    blocks: Blocks([
      MdSection(`A new incident \"${req.body.text}\" has been declared!`),
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
  res.sendStatus(200);
});

app.listen(8080, () => {
  // tslint:disable-next-line: no-console
  console.log(`server started at http://localhost:8080`);
});
