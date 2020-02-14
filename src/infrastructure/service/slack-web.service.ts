import { Injectable, Logger } from "@nestjs/common";
import { WebClient, KnownBlock, Block } from "@slack/web-api";
import * as moment from "moment-timezone";

@Injectable()
export class SlackWebService {
  private readonly logger = new Logger(SlackWebService.name);

  private client: WebClient = new WebClient(process.env.SLACK_BOT_TOKEN)

  public async sendMessage(channel: string, text: string) {
    this.logger.log(`sent message '${text}' to channel '${channel}'`)
    return this.client.chat.postMessage({
      channel,
      text
    })
  }

  public async sendBlocksMessage(channel: string, summary: string, blocks: (KnownBlock | Block)[]) {
    this.logger.log(`sent blocks message '${summary}' to channel '${channel}'`)
    return this.client.chat.postMessage({
      channel,
      blocks,
      text: summary
    })
  }

  public async sendSurveyRequest(surveyId, userId, eventName, eventStartDate, eventEndDate, timezone) {
    return this.sendBlocksMessage(
      userId,
      `Cześć <@${userId}>! 👋 Przed chwilą uczestniczyłeś/łaś w spotkaniu *${eventName}*`,
      [
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text":
              `Cześć <@${userId}>! 👋 \n` +
              `Przed chwilą uczestniczyłeś/łaś w spotkaniu *${eventName}* \n` +
              `Zgodnie z kalendarzem powinno zacząć się o *${moment(eventStartDate).tz(timezone).format(`HH:mm`)}* i skończyć o *${moment(eventEndDate).tz(timezone).format(`HH:mm`)}*. ` +
              `Daj znać czy wszystko poszło dobrze wypełniając szybką ankietę :nerd_face:`

          }
        },
        {
          "type": "actions",
          "elements": [
            {
              "type": "button",
              "text": {
                "type": "plain_text",
                "text": "Wypełnij ankietę ✍️",
                "emoji": true
              },
              "style": "primary",
              "value": `start_survey__${surveyId}`
            }
          ]
        }
      ])
  }

  public async sendSurveySuccessMessage(userId) {
  return this.sendMessage(userId, `Dzięki za wypełnienie! 🙌`)
  }

  public async sendSurveyDialog(triggerId: string, surveyId: string) {
    this.logger.log(`sent survey dialog triggerId: '${triggerId}' surveyId '${surveyId}'`)
    return this.client.views.open({
      trigger_id: triggerId,
      view: {
        type: 'modal',
        callback_id: `survey__${surveyId}`,
        title: {
          type: 'plain_text',
          text: 'Ankieta'
        },
        submit: {
          type: 'plain_text',
          text: 'Wyślij'
        },
        blocks: [
          {
            type: 'input',
            label: {
              type: "plain_text",
              text: "🗓 Ogólna ocena spotkania"
            },
            element: {
              type: "static_select",
              action_id: "rate",
              placeholder: {
                type: "plain_text",
                text: "1-5"
              },
              options: [
                {
                  "text": {
                    "type": "plain_text",
                    "text": "1"
                  },
                  "value": "1"
                },
                {
                  "text": {
                    "type": "plain_text",
                    "text": "2"
                  },
                  "value": "2"
                },
                {
                  "text": {
                    "type": "plain_text",
                    "text": "3"
                  },
                  "value": "3"
                },
                {
                  "text": {
                    "type": "plain_text",
                    "text": "4"
                  },
                  "value": "4"
                },
                {
                  "text": {
                    "type": "plain_text",
                    "text": "5"
                  },
                  "value": "5"
                }
              ]
            }
          },
          {
            type: 'input',
            label: {
              type: "plain_text",
              text: "⏱ Czy spotkanie zaczęło się o czasie?"
            },
            element: {
              type: "static_select",
              action_id: "no_delay",
              placeholder: {
                type: "plain_text",
                text: "Tak/Nie",
                emoji: true
              },
              options: [
                {
                  "text": {
                    "type": "plain_text",
                    "text": "Tak",
                    "emoji": true
                  },
                  "value": "1"
                },
                {
                  "text": {
                    "type": "plain_text",
                    "text": "Nie",
                    "emoji": true
                  },
                  "value": "0"
                }
              ]
            }
          },
          {
            type: 'input',
            label: {
              type: "plain_text",
              text: "🎉 Czy cel spotkania został osiągnięty?"
            },
            element: {
              type: "static_select",
              action_id: "target",
              placeholder: {
                type: "plain_text",
                text: "Tak/Nie",
                emoji: true
              },
              options: [
                {
                  "text": {
                    "type": "plain_text",
                    "text": "Tak",
                    "emoji": true
                  },
                  "value": "1"
                },
                {
                  "text": {
                    "type": "plain_text",
                    "text": "Nie",
                    "emoji": true
                  },
                  "value": "0"
                }
              ]
            }
          },
          {
            type: 'input',
            label: {
              type: "plain_text",
              text: "⌛ Na ile zostało zaplanowane spotkanie?️"
            },
            element: {
              type: "static_select",
              action_id: "scheduled_time",
              placeholder: {
                type: "plain_text",
                text: "Tak/Nie",
                emoji: true
              },
              "options": [
                {
                  "text": {
                    "type": "plain_text",
                    "text": "15 min",
                    "emoji": true
                  },
                  "value": "15"
                },
                {
                  "text": {
                    "type": "plain_text",
                    "text": "30 min",
                    "emoji": true
                  },
                  "value": "30"
                },
                {
                  "text": {
                    "type": "plain_text",
                    "text": "45 min",
                    "emoji": true
                  },
                  "value": "45"
                },
                {
                  "text": {
                    "type": "plain_text",
                    "text": "60 min",
                    "emoji": true
                  },
                  "value": "60"
                },
                {
                  "text": {
                    "type": "plain_text",
                    "text": "75 min",
                    "emoji": true
                  },
                  "value": "70"
                },
                {
                  "text": {
                    "type": "plain_text",
                    "text": "90 min",
                    "emoji": true
                  },
                  "value": "90"
                },
                {
                  "text": {
                    "type": "plain_text",
                    "text": "90+ min",
                    "emoji": true
                  },
                  "value": "90+"
                }
              ]
            }
          },
          {
            type: 'input',
            label: {
              type: "plain_text",
              text: "⏰ Czy spotkanie przedłużyło się? Jeśli tak to o ile?"
            },
            element: {
              type: "static_select",
              action_id: "scheduled_time",
              placeholder: {
                type: "plain_text",
                text: "Tak/Nie",
                emoji: true
              },
              "options": [
                {
                  "text": {
                    "type": "plain_text",
                    "text": "0 min",
                    "emoji": true
                  },
                  "value": "0"
                },
                {
                  "text": {
                    "type": "plain_text",
                    "text": "15 min",
                    "emoji": true
                  },
                  "value": "15"
                },
                {
                  "text": {
                    "type": "plain_text",
                    "text": "30 min",
                    "emoji": true
                  },
                  "value": "30"
                },
                {
                  "text": {
                    "type": "plain_text",
                    "text": "30+ min",
                    "emoji": true
                  },
                  "value": "30+"
                }
              ]
            }
          }
        ]
      }
    });
  }
}
