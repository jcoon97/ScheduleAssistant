import { Arg, Authorized, Mutation, Resolver } from "type-graphql";
import { InjectRepository } from "typeorm-typedi-extensions";
import { Program } from "../../entities/Program";
import { Shift } from "../../entities/Shift";
import { RoleType, User } from "../../entities/User";
import { ProgramRepository } from "../../repositories/ProgramRepository";
import { ShiftRepository } from "../../repositories/ShiftRepository";
import { UserRepository } from "../../repositories/UserRepository";
import { ProgramDoesNotExist, UserDoesNotExist } from "../errors/checkers/entity-not-exists";
import { IsNotUUID } from "../errors/checkers/uuid";
import { UserError } from "../errors/UserError";
import { UserErrorBuilder } from "../errors/UserErrorBuilder";
import { CreateShiftInput } from "../input-types/shift";
import { CreateShiftPayload } from "../payloads/shift";

@Resolver(() => Shift)
export class ShiftResolver {
    @InjectRepository(Program)
    private readonly programRepository!: ProgramRepository;

    @InjectRepository(Shift)
    private readonly shiftRepository!: ShiftRepository;

    @InjectRepository(User)
    private readonly userRepository!: UserRepository;

    @Authorized(RoleType.LA_MANAGER)
    @Mutation(() => CreateShiftPayload, {
        description: "Creates a new shift.",
        name: "shiftCreate"
    })
    async createShift(@Arg("input") input: CreateShiftInput): Promise<CreateShiftPayload> {
        const userErrors: UserError[] = await new UserErrorBuilder()
            .check([ "input", "userId" ], IsNotUUID, { nullable: true, value: input.userId })
            .check([ "input", "programId" ], IsNotUUID, { value: input.programId })
            .check([ "input", "userId" ], UserDoesNotExist, { nullable: true, property: "id", value: input.userId })
            .check([ "input", "programId" ], ProgramDoesNotExist, { property: "id", value: input.programId })
            .build();

        if (userErrors.length > 0) return { shift: undefined, userErrors };

        const program: Program = (await this.programRepository.findOne({ id: input.programId }))!;
        let user: User | undefined;
        if (input.userId) user = (await this.userRepository.findOne({ id: input.userId }))!;

        let shift: Shift = this.shiftRepository.create({ program, user, workdays: input.workdays });
        shift = await this.shiftRepository.save(shift);
        return { shift, userErrors };
    }
}