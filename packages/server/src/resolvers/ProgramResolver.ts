import { Arg, Args, Authorized, FieldResolver, Mutation, Query, Resolver, ResolverInterface, Root } from "type-graphql";
import { InjectRepository } from "typeorm-typedi-extensions";
import { GetProgramByIdArgs } from "../args-types/GetProgramByIdArgs";
import { Program } from "../entities/Program";
import { RoleType, User } from "../entities/User";
import { AssignUserProgramInput } from "../input-types/AssignUserProgramInput";
import { ChangeProgramLeadOrManagerInput } from "../input-types/ChangeProgramLeadOrManagerInput";
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
    async assignProgramUser(@Arg("input") input: AssignUserProgramInput): Promise<Program> {
        const program: Program = (await this.programRepository.findOne({ id: input.programId }))!;
        const user: User = (await this.userRepository.findOne({ id: input.userId }))!;
        const programUsers: User[] = await program.users;

        // Check that user is not already present in program
        if (programUsers.some((user: User) => user.id == input.userId)) {
            throw new Error("User is already assigned to the specified program");
        }

        // Push user to array of program users
        programUsers.push(user);

        // Additionally, if the user is specified to be a lead or manager, and they are not
        // already defined as such, then set them in the program entity
        if (input.isLeadOrManager && ((await program.leadOrManager)?.id !== user.id)) {
            program.leadOrManager = user;
        }
        return this.programRepository.save(program);
    }

    @Authorized(RoleType.ADMIN)
    @Mutation(() => Program, { name: "programChangeLeadOrManager" })
    async changeProgramLeadOrManager(@Arg("input") input: ChangeProgramLeadOrManagerInput): Promise<Program> {
        const program: Program = (await this.programRepository.findOne({ id: input.programId }))!;
        const user: User = (await this.userRepository.findOne({ id: input.userId }))!;
        const programManager: User | undefined = await program.leadOrManager;

        // Confirm that the specified user isn't already manager
        if (programManager?.id === user.id) {
            throw new Error("User is already the specified program lead or manager");
        }

        program.leadOrManager = user;
        return this.programRepository.save(program);
    }

    @Authorized(RoleType.ADMIN)
    @Mutation(() => Program, { name: "programCreate" })
    async createProgram(@Arg("input") input: CreateProgramInput): Promise<Program> {
        const program = this.programRepository.create({ ...input });
        return this.programRepository.save(program);
    }

    @Authorized()
    @Query(() => Program, { name: "program" })
    async getProgramById(@Args() args: GetProgramByIdArgs): Promise<Program> {
        return (await this.programRepository.findOne({ id: args.id }))!;
    }

    @FieldResolver()
    async users(@Root() program: Program): Promise<User[]> {
        return program.users;
    }
}