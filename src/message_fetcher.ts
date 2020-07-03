import { App } from "@slack/bolt";
import { IncidentState } from "./types/incident_state";
import { WebAPICallResult } from "@slack/web-api";
import moment from "moment";

interface ListResponse extends WebAPICallResult {
  channels?: any[];
}

interface ReactionsResponse extends WebAPICallResult {
  reactions?: any[];
}
export class MessageFetcher {
  app: App;
  incidentState: IncidentState;

  constructor(app: App, incidentState: IncidentState) {
    this.app = app;
    this.incidentState = incidentState;
  }

  private async getChannelId(): Promise<string> {
    try {
      let listResponse: ListResponse = await this.app.client.conversations.list(
        {
          token: process.env.SLACK_API_TOKEN,
          types: "public_channel",
        }
      );
      return Promise.resolve(
        listResponse.channels
          .filter((x) => {
            return x.name === "govuk-pay-incident";
          })
          .map((x) => x.id)[0]
      );
    } catch (error) {
      console.error(error);
      Promise.reject(error);
    }
  }

  async getMessages(): Promise<any[]> {
    try {
      const channelId = await this.getChannelId();
      let messages: any[] = [];
      let currentMessages = await this.app.client.conversations.history({
        channel: channelId,
        token: process.env.SLACK_API_TOKEN,
        limit: 100,
        oldest: (
          parseInt(this.incidentState.incidentStartTime) / 1000
        ).toString(),
      });
      messages = messages.concat(currentMessages.messages);
      if (
        currentMessages.response &&
        currentMessages.response_metadata.next_cursor
      ) {
        let moreMessages = true;
        while (moreMessages) {
          currentMessages = await this.app.client.conversations.history({
            channel: channelId,
            token: process.env.SLACK_API_TOKEN,
            limit: 100,
            cursor: currentMessages.response_metadata.next_cursor,
          });
          messages = messages.concat(currentMessages.messages);
          if (!currentMessages.response_metadata.next_cursor) {
            moreMessages = false;
          }
        }
      }
      return Promise.all(
        messages.map(async (x) => await this.mapResponse(x, channelId))
      );
    } catch (error) {
      console.error(error);
    }
  }

  async mapResponse(message: any, channelId: string) {
    return {
      message: message,
      reactions: await this.getMessageReaction(message.ts, channelId),
    };
  }

  async getMessageReaction(
    timestamp: string,
    channelId: string
  ): Promise<any[]> {
    try {
      const reactions: ReactionsResponse = await this.app.client.reactions.get({
        timestamp: timestamp,
        token: process.env.SLACK_API_TOKEN,
        channel: channelId,
        full: true,
      });
      const reactionsMessage: any = reactions.message;
      if (
        reactions.ok &&
        reactionsMessage.reactions &&
        reactionsMessage.reactions.length > 0
      ) {
        return Promise.resolve(
          reactionsMessage.reactions.map((x: { name: any }) => x.name)
        );
      } else {
        return Promise.resolve([]);
      }
    } catch (error) {
      console.error(error);
      Promise.reject(error);
    }
  }

  parseMessage(message: any) {
    return `${moment(message.message.ts * 1000).format('YYYY-MM-DD HH:mm')} - ${
      message.message.blocks[0].elements[0].elements[0].text
    }`;
  }
}
