import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UserService } from "../application/user.service";
import { GoogleApiService } from "../infrastructure/service/google-api.service";
import moment = require("moment-timezone");
import { SurveyService } from "../application/survey.service";

@Injectable()
export class TaskScheduler {
  private readonly logger = new Logger(TaskScheduler.name);

  constructor(
    private readonly userService: UserService,
    private readonly googleApiService: GoogleApiService,
    private readonly surveyService: SurveyService,
  ) {
  }

  @Cron('0 */10 5-23 * * *')
  public async performEventsLookup() {
    this.logger.log('started events lookup');

    const users = await this.userService.findAllUsersToLookupEvents()

    for (const user of users) {
      try {
        const events = (await this.googleApiService.getEventsByCalendar(
          user.email,
          moment().subtract(2, 'hours').toDate(),
          moment().add(2, 'hours').toDate()
        )).data.items

        this.logger.log(`found ${events.length} events, userId: ${user.id}, userEmail: ${user.email}`);

        for (const event of events) {
          if (event.status !== 'cancelled' && Array.isArray(event.attendees)) {
            const userAsAttendeee = event.attendees.find((x) => x.email === user.email)

            if (
              userAsAttendeee &&
              userAsAttendeee.responseStatus !== 'declined' &&
              moment().diff(moment(event.end.dateTime), 'minutes') > 5
            ) {
              this.logger.log(`creating survey for ended event '${event.summary}' (${event.start.dateTime} - ${event.end.dateTime}), userId: ${user.id}, userEmail: ${user.email}`);
              this.surveyService.createSurvey(
                user.id,
                event.summary as string,
                event.id,
                moment(event.start.dateTime).toDate(),
                moment(event.end.dateTime).toDate(),
                "Europe/Warsaw"
              )
            }
          }
        }
      } catch (error) {
        this.logger.error(`Cannot lookup events, email: ${user.email}, startDate: ${moment().subtract(15, 'minutes').format()}, endDate: ${moment().format()}`);
        this.logger.error(JSON.stringify(error));
      }
    }

    this.logger.log('ended events lookup');
  }
}
