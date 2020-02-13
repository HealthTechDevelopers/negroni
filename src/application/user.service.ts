import { Injectable, Logger } from '@nestjs/common';
import { UserRepository } from "../infrastructure/repository/user.repository";
import { User } from "../domain/user";

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly userRepository: UserRepository,
  ) {
  }

  findAllUsersToLookupEvents(): Promise<User[]> {
    return this.userRepository.find({
      isIgnored: false
    });
  }
}
