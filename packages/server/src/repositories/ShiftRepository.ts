import { Service } from "typedi";
import { EntityRepository } from "typeorm";
import { Shift } from "../entities/Shift";
import { BaseRepository } from "./BaseRepository";

@EntityRepository(Shift)
@Service()
export class ShiftRepository extends BaseRepository<Shift> {

}