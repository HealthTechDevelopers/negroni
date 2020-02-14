import { Injectable, Logger } from "@nestjs/common";
import { google } from "googleapis";
import moment = require("moment-timezone");

@Injectable()
export class GoogleApiService {
  private readonly logger = new Logger(GoogleApiService.name);

  private readonly oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_OAUTH_CLIENT_ID,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    ''
  )

  constructor() {
    this.oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_OAUTH_REFRESH_TOKEN
    })
  }

  getEventsByCalendar(email: string, startDate: Date, endDate: Date) {
    const calendar = google.calendar({
      version: 'v3',
      auth: this.oauth2Client,
    })

    this.logger.log(`fetched google calendar events for calendar ${email}, startDate: ${moment(startDate).utc().format()}, endDate: ${moment(endDate).utc().format()}`)

    return calendar.events.list({
      calendarId: email,
      singleEvents: true,
      timeMin: moment(startDate).utc().format(),
      timeMax: moment(endDate).utc().format(),
    })
  }
}
