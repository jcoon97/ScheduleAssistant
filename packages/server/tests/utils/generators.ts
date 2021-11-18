import { Connection, Repository } from "typeorm";
import { Program } from "../../src/entities/Program";
import { RoleType, User } from "../../src/entities/User";

export const FAKES: FakeData = {
    USER_ADMINISTRATOR: {
        emailAddress: "fake.admin@example.com",
        googleId: "882545233602",
        roleType: RoleType.ADMIN
    },
    USER_DEFAULT: {
        emailAddress: "fake.user@example.com",
        googleId: "461943365702",
        roleType: RoleType.DEFAULT
    },
    PROGRAM: {
        abbreviation: "ABC",
        name: "A Fake Program"
    }
};

export type AllowedKeys = "USER_ADMINISTRATOR" | "USER_DEFAULT" | "PROGRAM";

export type AllowedProperties = FakeProgramProperties | FakeUserProperties;

export type FakeData = Record<AllowedKeys, AllowedProperties>;

export type FakeProgramProperties = Required<Pick<Program, "abbreviation" | "name">>;

export type FakeUserProperties = Required<Pick<User, "emailAddress" | "googleId" | "roleType">>;

export async function generateFakeProgram(connection: Connection, program: FakeProgramProperties): Promise<Program> {
    const repository: Repository<Program> = connection.getRepository(Program);
    const newProgram: Program = repository.create(program);
    return await repository.save(newProgram);
}

export async function generateFakeUser(connection: Connection, user: FakeUserProperties): Promise<User> {
    const repository: Repository<User> = connection.getRepository(User);
    const newUser: User = repository.create(user);
    return await repository.save(newUser);
}