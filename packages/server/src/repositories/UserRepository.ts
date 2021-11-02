import { Service } from "typedi";
import { EntityRepository } from "typeorm";
import User from "../entities/User";
import { BaseRepository } from "./BaseRepository";

@Service()
@EntityRepository(User)
export class UserRepository extends BaseRepository<User> {
    
}