import { EntityRepository, Repository } from "typeorm";
import { User } from "../../domain/user";

@EntityRepository(User)
export class UserRepository extends Repository<User> {}
