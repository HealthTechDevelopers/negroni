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
    const messages = [
      `Cześć <@${userId}>! 👋 \nPrzed chwilą uczestniczyłeś(aś) w spotkaniu *${eventName}* \nZgodnie z kalendarzem powinno zacząć się o *${moment(eventStartDate).tz(timezone).format(`HH:mm`)}* i skończyć o *${moment(eventEndDate).tz(timezone).format(`HH:mm`)}*. Daj znać czy wszystko poszło dobrze wypełniając szybką ankietę:`,
      `Darz bór <@${userId}>, przed chwilą skończyłeś(aś) spotkanie *${eventName}* \nTwój kalendarz powiedział nam, że powinno się ono zacząć o *${moment(eventStartDate).tz(timezone).format(`HH:mm`)}* i skończyć o *${moment(eventEndDate).tz(timezone).format(`HH:mm`)}*. Wypełnij naszą błyskawiczną ankietę, zostaw po sobie ślad w statystykach:`,
      `Siemeczka-loteczka, z pewnych źródeł wiemy, że właśnie skończyłeś(aś) spotkanie *${eventName}* \nJeśli Twój kalendarz nie kłamie powinno ono potrwać od *${moment(eventStartDate).tz(timezone).format(`HH:mm`)}* do *${moment(eventEndDate).tz(timezone).format(`HH:mm`)}*. Daj znać, czy faktycznie tak było:`,
    ]

    const message = this.randomizeMessage(messages)

    return this.sendBlocksMessage(
      userId,
      message,
      [
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": message
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
            },
            {
              "type": "button",
              "text": {
                "type": "plain_text",
                "text": "Spotkanie nie odbyło się",
                "emoji": true
              },
              "style": "danger",
              "value": `reject_survey__${surveyId}`
            }
          ]
        }
      ])
  }

  public async sendSurveyCompletedMessage(userId) {
    const thanksMessages = [
      'Dzięki! 🙌',
      'Ok, mam to! 👌',
      'Super 😻',
      'Przyjemność z Tobą to czysty interes! 🍻',
      'Klasa! 👏',
      'Dzięki!',
      `Zapisałem, dzięki <@${userId}>`,
      '🙌',
      'Uprzejmie dziękuję 🤓',
      'Szybko pojszło!',
      'Jesteś zwycięzcą :trophy:',
      'Danke, merci i здраствуйте!',
      'Cudowności, all hearts :hearts:'
    ]

    const message = this.randomizeMessage(thanksMessages)

    return this.sendMessage(userId, message)
  }

  public async sendSurveyRejectedMessage(userId) {
    const thanksMessages = [
      'Dzięki, odnotowane! 🙌',
      'Ok, cenna informacja! :nerd_face:',
      'Dzięki!',
      `Zapisałem, dzięki <@${userId}>`
    ]

    const message = this.randomizeMessage(thanksMessages)

    return this.sendMessage(userId, message)
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
              action_id: "general_rate",
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
              text: "🎉 Czy cel spotkania został osiągnięty?"
            },
            element: {
              type: "static_select",
              action_id: "target_achieved",
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
              text: "📝 Czy do spotkania została przygotowana agenda?"
            },
            element: {
              type: "static_select",
              action_id: "has_agenda",
              placeholder: {
                type: "plain_text",
                text: "Tak/Nie/Było to wydarzenie scrumowe",
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
                },
                {
                  "text": {
                    "type": "plain_text",
                    "text": "Było to wydarzenie scrumowe",
                    "emoji": true
                  },
                  "value": "2"
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
              action_id: "punctual",
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
                    "text": "90 min",
                    "emoji": true
                  },
                  "value": "90"
                },
                {
                  "text": {
                    "type": "plain_text",
                    "text": "120 min",
                    "emoji": true
                  },
                  "value": "120"
                },
                {
                  "text": {
                    "type": "plain_text",
                    "text": "więcej",
                    "emoji": true
                  },
                  "value": "120+"
                }
              ]
            }
          },
          {
            type: 'input',
            label: {
              type: "plain_text",
              text: "⏰ Czy spotkanie zostało przedłużone? Jeśli tak to ile?"
            },
            element: {
              type: "static_select",
              action_id: "extended",
              placeholder: {
                type: "plain_text",
                text: "Tak/Nie",
                emoji: true
              },
              "options": [
                {
                  "text": {
                    "type": "plain_text",
                    "text": "0 min - wszystko cool",
                    "emoji": true
                  },
                  "value": "0"
                },
                {
                  "text": {
                    "type": "plain_text",
                    "text": "5 min",
                    "emoji": true
                  },
                  "value": "5"
                },
                {
                  "text": {
                    "type": "plain_text",
                    "text": "10 min",
                    "emoji": true
                  },
                  "value": "10"
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
                    "text": "20 min",
                    "emoji": true
                  },
                  "value": "20"
                },
                {
                  "text": {
                    "type": "plain_text",
                    "text": "więcej",
                    "emoji": true
                  },
                  "value": "20+"
                }
              ]
            }
          }
        ]
      }
    });
  }

  private randomizeMessage(messages) {
    return messages[Math.floor(Math.random() * messages.length)]
  }
}
