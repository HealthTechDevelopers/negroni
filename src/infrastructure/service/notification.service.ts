import { Injectable, Logger } from "@nestjs/common";
import { SlackWebService } from "./slack-web.service";
import * as moment from 'moment-timezone'

@Injectable()
export class NotificationService {
  static CHANNEL: string = process.env.SLACK_NOTIFICATIONS_CHANNEL;

  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly slackWebService: SlackWebService,
  ) {}

  public sendSurveySent(userId: string, eventName: string, eventStartDate: Date, eventEndDate: Date) {
    this.logger.log(`sent notification 'survey_sent' to channel ${NotificationService.CHANNEL}, userId: ${userId}, eventName: ${eventName}`)
    return this.slackWebService.sendMessage(
      NotificationService.CHANNEL,
      `Ankieta dotycząca spotkania *${eventName} (${moment(eventStartDate).tz('Europe/Warsaw').format('HH:mm')} - ${moment(eventEndDate).tz('Europe/Warsaw').format('HH:mm')})* została wysłana do <@${userId}>`
    )
  }

  public sendSurveyCompleted(userId: string, eventName: string, eventStartDate: Date, eventEndDate: Date, result: any) {
    this.logger.log(`sent notification 'survey_completed' to channel ${NotificationService.CHANNEL}, userId: ${userId}, eventName: ${eventName}`)
    return this.slackWebService.sendMessage(
      NotificationService.CHANNEL,
      `<@${userId}> uzupełnił(ła) ankietę dotyczącą spotkania *${eventName} (${moment(eventStartDate).tz('Europe/Warsaw').format('HH:mm')} - ${moment(eventEndDate).tz('Europe/Warsaw').format('HH:mm')})* \n \`\`\`${JSON.stringify(result)}\`\`\``
    )
  }
}
