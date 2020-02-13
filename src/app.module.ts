import { Module } from '@nestjs/common';
import { TypeOrmModule } from "@nestjs/typeorm";
import { Survey } from "./domain/survey";
import { User } from "./domain/user";
import { SlackInteractionsController } from "./web/controller/slack-interactions.controller";
import { SlackWebService } from "./infrastructure/service/slack-web.service";
import { SurveyRepository } from "./infrastructure/repository/survey.repository";
import { SurveyService } from "./application/survey.service";
import { GoogleApiService } from "./infrastructure/service/google-api.service";
import { ScheduleModule } from "@nestjs/schedule";
import { TaskScheduler } from "./cron/task-scheduler";
import { UserRepository } from "./infrastructure/repository/user.repository";
import { UserService } from "./application/user.service";
import { NotificationService } from "./infrastructure/service/notification.service";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [Survey, User],
      synchronize: true
    }),
    TypeOrmModule.forFeature([SurveyRepository, UserRepository]),
    ScheduleModule.forRoot(),
  ],
  controllers: [SlackInteractionsController],
  providers: [GoogleApiService, SlackWebService, SurveyService, UserService, TaskScheduler, NotificationService],
})
export class AppModule {
}
