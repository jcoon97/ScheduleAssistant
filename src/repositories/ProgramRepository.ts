import { Service } from "typedi";
import { EntityRepository } from "typeorm";
import { Program } from "../entities/Program";
import { BaseRepository } from "./BaseRepository";

@EntityRepository(Program)
@Service()
export class ProgramRepository extends BaseRepository<Program> {

}