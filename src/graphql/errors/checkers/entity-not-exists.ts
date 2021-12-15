import { EntityTarget, getRepository, Repository } from "typeorm";
import { BaseEntity } from "../../../entities/BaseEntity";
import { Program } from "../../../entities/Program";
import { User } from "../../../entities/User";
import { BaseCheckerArgs, BaseErrorChecker } from "../UserErrorBuilder";

interface EntityDoesNotExistArgs<T extends BaseEntity> extends BaseCheckerArgs {
    property: keyof T;
    value?: string;
}

class EntityDoesNotExist<T extends BaseEntity> extends BaseErrorChecker<EntityDoesNotExistArgs<T>> {
    private readonly entityTarget: EntityTarget<T>;

    constructor(entityTarget: EntityTarget<T>) {
        super();
        this.entityTarget = entityTarget;
    }

    async check(args: EntityDoesNotExistArgs<T>): Promise<string | null> {
        if ((!args.property || !args.value) && args.nullable) return null;

        const repository: Repository<T> = getRepository(this.entityTarget);
        const foundEntity: T | undefined = await repository.findOne({ [args.property]: args.value });

        if (!foundEntity) {
            return args.message ?? "Entity does not exist in the database.";
        }
        return null;
    }
}

export class UserDoesNotExist extends EntityDoesNotExist<User> {
    constructor() {
        super(User);
    }
}

export class ProgramDoesNotExist extends EntityDoesNotExist<Program> {
    constructor() {
        super(Program);
    }
}