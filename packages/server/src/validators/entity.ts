import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraintInterface
} from "class-validator";
import { EntityTarget, getRepository, ObjectLiteral, Repository } from "typeorm";

const UUID_V4_PATTERN = new RegExp(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i);

export function checkEntity<T extends ObjectLiteral>(defaultMessage: string): ValidatorConstraintInterface {
    return {
        defaultMessage(): string {
            return defaultMessage;
        },
        async validate(value: any, args: ValidationArguments): Promise<boolean> {
            const [ entityClass, entityPropertyName, invertResult ]: [ EntityTarget<T>, keyof T, boolean | undefined ] = <any>args.constraints;
            if (entityPropertyName === "id" && !UUID_V4_PATTERN.test(value)) return false;
            const repository: Repository<T> = getRepository(entityClass);
            const entity: T | undefined = await repository.findOne({ [entityPropertyName]: value });
            return (invertResult ? entity === undefined : entity !== undefined);
        }
    };
}

export function IsEntityFound<T extends ObjectLiteral>(
    entityClass: EntityTarget<T>,
    entityPropertyName?: keyof T,
    validationOptions?: ValidationOptions
): Function {
    const defaultMessage: string = "Entity could not be found in the database";

    return function (object: Object, propertyName: string): void {
        registerDecorator({
            constraints: [ entityClass, entityPropertyName || propertyName ],
            name: "entityIsFound",
            options: validationOptions,
            propertyName: propertyName,
            target: object.constructor,
            validator: checkEntity(defaultMessage)
        });
    };
}

export function IsEntityNotFound<T extends ObjectLiteral>(
    entityClass: EntityTarget<T>,
    entityPropertyName?: keyof T,
    validationOptions?: ValidationOptions
): Function {
    const defaultMessage: string = "Entity already exists in the database";

    return function (object: Object, propertyName: string): void {
        registerDecorator({
            constraints: [ entityClass, entityPropertyName || propertyName, true ],
            name: "entityIsNotFound",
            options: validationOptions,
            propertyName: propertyName,
            target: object.constructor,
            validator: checkEntity(defaultMessage)
        });
    };
}