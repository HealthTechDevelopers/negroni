import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryColumn()
  public id: string;

  @Column()
  public email: string;

  @Column()
  public role: string;

  @Column()
  public isIgnored: boolean = false;
}
