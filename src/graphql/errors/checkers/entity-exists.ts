import { EntityTarget, getRepository, Repository } from "typeorm";
import { BaseEntity } from "../../../entities/BaseEntity";
import { Program } from "../../../entities/Program";
import { User } from "../../../entities/User";
import { BaseCheckerArgs, BaseErrorChecker } from "../UserErrorBuilder";

interface EntityDoesExistArgs<T extends BaseEntity> extends BaseCheckerArgs {
    property: keyof T;
    value?: any;
}

class EntityDoesExist<T extends BaseEntity> extends BaseErrorChecker<EntityDoesExistArgs<T>> {
    private readonly entityTarget: EntityTarget<T>;

    constructor(entityTarget: EntityTarget<T>) {
        super();
        this.entityTarget = entityTarget;
    }

    async check(args: EntityDoesExistArgs<T>): Promise<string | null> {
        if (args.nullable && (!args.property || !args.value)) return null;

        if (!args.nullable && (!args.property || !args.nullable)) {
            throw new Error("Property and value cannot be undefined or null, unless nullable is set to true");
        }

        const repository: Repository<T> = getRepository(this.entityTarget);
        const foundEntity: T | undefined = await repository.findOne({ [args.property]: args.value });

        if (foundEntity) {
            return args.message ?? "Entity already exists in the database.";
        }
        return null;
    }
}

export class UserDoesExist extends EntityDoesExist<User> {
    constructor() {
        super(User);
    }
}

export class ProgramDoesExist extends EntityDoesExist<Program> {
    constructor() {
        super(Program);
    }
}