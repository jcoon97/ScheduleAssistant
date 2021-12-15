import { Service } from "typedi";
import { EntityRepository } from "typeorm";
import { User } from "../entities/User";
import { BaseRepository } from "./BaseRepository";

@EntityRepository(User)
@Service()
export class UserRepository extends BaseRepository<User> {

}