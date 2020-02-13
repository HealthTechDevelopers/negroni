import { EntityRepository, Repository } from "typeorm";
import { Survey } from "../../domain/survey";

@EntityRepository(Survey)
export class SurveyRepository extends Repository<Survey> {}
