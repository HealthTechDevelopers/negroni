import { Body, Controller, Logger, Post } from '@nestjs/common';
import { SlackWebService } from "../../infrastructure/service/slack-web.service";
import { SurveyService } from "../../application/survey.service";

@Controller('/slack/interactions')
export class SlackInteractionsController {
  private readonly logger = new Logger(SlackInteractionsController.name);

  constructor(
    private slackWebService: SlackWebService,
    private surveyService: SurveyService,
  ) {
  }

  @Post()
  async index(
    @Body('payload') payload,
  ) {
    const decodedPayload = JSON.parse(payload)
    const {type, actions, trigger_id, view} = decodedPayload

    this.logger.log(`received request, type: ${type}`)

    if (type === 'block_actions') {
      if (actions[0].value.includes('start_survey')) {
        const surveyId = actions[0].value.split('__')[1];
        await this.slackWebService.sendSurveyDialog(trigger_id, surveyId)
      }

      if (actions[0].value.includes('reject_survey')) {
        const surveyId = actions[0].value.split('__')[1];
        await this.surveyService.rejectSurvey(surveyId)
      }
    }

    if (type === 'view_submission') {
      const result = Object
        .entries(view.state.values)
        .reduce((acc, [_prop, obj]) => ({
          ...acc,
          ...Object
            .keys(obj)
            .reduce((acc, key) => ({[key]: obj[key].selected_option.value}), {})
        }), {})

      const surveyId = view.callback_id.split('__')[1]

      await this.surveyService.completeSurvey(surveyId, result)
    }

    return null;
  }
}
