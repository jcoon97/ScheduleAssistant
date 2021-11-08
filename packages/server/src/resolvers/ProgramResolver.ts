import { Arg, Authorized, FieldResolver, Mutation, Resolver, ResolverInterface, Root } from "type-graphql";
import { InjectRepository } from "typeorm-typedi-extensions";
import { Program } from "../entities/Program";
import { RoleType, User } from "../entities/User";
import { AssignUserProgramInput } from "../input-types/AssignUserProgramInput";
import { CreateProgramInput } from "../input-types/CreateProgramInput";
import { ProgramRepository } from "../repositories/ProgramRepository";
import { UserRepository } from "../repositories/UserRepository";

@Resolver(() => Program)
export class ProgramResolver implements ResolverInterface<Program> {
    @InjectRepository(Program)
    private readonly programRepository!: ProgramRepository;

    @InjectRepository(User)
    private readonly userRepository!: UserRepository;

    @Authorized(RoleType.ADMIN)
    @Mutation(() => Program, { name: "programAssignUser" })
    async assignProgramUser(@Arg("input") assignInput: AssignUserProgramInput): Promise<Program> {
        const program: Program = (await this.programRepository.findOne({ id: assignInput.programId }))!;
        const user: User = (await this.userRepository.findOne({ id: assignInput.userId }))!;

        // Check that user is not already present in program
        if ((await program.users).some((user: User) => user.id == assignInput.userId)) {
            throw new Error("User is already assigned to the specified program");
        }

        // Add user to program & return result
        (await program.users).push(user);
        return this.programRepository.save(program);
    }

    @Authorized(RoleType.ADMIN)
    @Mutation(() => Program, { name: "programCreate" })
    async createProgram(@Arg("input") programInput: CreateProgramInput): Promise<Program> {
        const program = this.programRepository.create({ ...programInput });
        return this.programRepository.save(program);
    }

    @FieldResolver()
    async users(@Root() program: Program): Promise<User[]> {
        return program.users;
    }
}