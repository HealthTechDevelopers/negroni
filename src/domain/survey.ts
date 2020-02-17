import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, BeforeInsert } from 'typeorm';
import moment = require("moment-timezone");

@Entity()
export class Survey {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  public respondentId: string;

  @Column()
  public status: string;

  @Column({type: 'jsonb'})
  public result: any = {};

  @Column()
  public eventName: string;

  @Column()
  public eventId: string;

  @Column({
    type: 'timestamptz'
  })
  public eventStartDate: Date;

  @Column({
    type: 'timestamptz'
  })
  public eventEndDate: Date;

  @CreateDateColumn({
    type: 'timestamptz',
    nullable: false
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
    nullable: false
  })
  updatedAt: Date;

  @Column({
    type: 'timestamptz',
    nullable: true
  })
  completedAt: Date | null = null;

  static new(
    id: Survey['id'],
    respondentId: Survey['respondentId'],
    eventName: Survey['eventName'],
    eventId: Survey['eventId'],
    eventStartDate: Survey['eventStartDate'],
    eventEndDate: Survey['eventEndDate']
  ): Survey {
    const survey = new Survey();
    survey.id = id;
    survey.respondentId = respondentId;
    survey.eventName = eventName;
    survey.eventId = eventId;
    survey.eventStartDate = eventStartDate;
    survey.eventEndDate = eventEndDate;
    survey.status = 'sent'
    return survey
  }

  public saveResult(result: any): void {
    this.result = result;
    this.completedAt = new Date();
    this.status = 'completed';
  }

  public reject(): void {
    this.status = 'rejected';
  }
}
