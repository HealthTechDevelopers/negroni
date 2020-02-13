import * as uuid from 'uuid/v4'
import { Injectable, Logger } from '@nestjs/common';
import { Survey } from "../domain/survey";
import { SurveyRepository } from "../infrastructure/repository/survey.repository";
import { SlackWebService } from "../infrastructure/service/slack-web.service";
import { NotificationService } from "../infrastructure/service/notification.service";

@Injectable()
export class SurveyService {
  private readonly logger = new Logger(SurveyService.name);

  constructor(
    private readonly surveyRepository: SurveyRepository,
    private readonly slackWebService: SlackWebService,
    private readonly notificationService: NotificationService,
  ) {
  }

  public async createSurvey(respondentId: string, eventName: string, eventId: string, eventStartDate: Date, eventEndDate: Date, respondentTimeZone: string): Promise<Survey | null> {
    if (!(await this.canCreateSurveyForEvent(respondentId, eventId))) {
      this.logger.log(`survey cannot be created, survey already created, respondent: ${respondentId}, eventId: ${eventId}, eventName: ${eventName}, (${eventStartDate} - ${eventEndDate})`)
      return null;
    }

    const survey = Survey.new(uuid(), respondentId, eventName, eventId, eventStartDate, eventEndDate);

    await this.slackWebService.sendSurveyRequest(survey.id, respondentId, eventName, eventStartDate, eventEndDate, respondentTimeZone);

    this.logger.log(`survey created, surveyId: ${survey.id}, respondent: ${respondentId}, eventId: ${eventId}, eventName: ${eventName}, (${eventStartDate} - ${eventEndDate})`)
    this.notificationService.sendSurveySent(respondentId, eventName, eventStartDate, eventEndDate);

    return this.surveyRepository.save(survey);
  }

  public async completeSurvey(surveyId: string, result: any): Promise<Survey> {
    const survey = await this.surveyRepository.findOne(surveyId)

    survey.saveResult(result);

    await this.slackWebService.sendSurveySuccessMessage(survey.respondentId)

    this.logger.log(`survey completed, surveyId: ${surveyId}, result: ${JSON.stringify(result)}), respondent: ${survey.respondentId}, eventId: ${survey.eventId}, eventName: ${survey.eventName}, (${survey.eventStartDate} - ${survey.eventEndDate})`)
    this.notificationService.sendSurveyCompleted(survey.respondentId, survey.eventName, survey.eventStartDate, survey.eventEndDate);

    return this.surveyRepository.save(survey);
  }

  public async canCreateSurveyForEvent(respondentId: string, eventId): Promise<boolean> {
    const surveyCount = await this.surveyRepository.count({ respondentId, eventId })
    return surveyCount === 0
  }
}
