import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraintInterface
} from "class-validator";
import { EntityTarget, getRepository, ObjectLiteral, Repository } from "typeorm";

export function checkEntity<T extends ObjectLiteral>(): ValidatorConstraintInterface {
    return {
        async validate(value: any, args: ValidationArguments): Promise<boolean> {
            const [ entityClass, entityPropertyName, invertResult ]: [ EntityTarget<T>, keyof T, boolean | undefined ] = <any>args.constraints;
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
    return function (object: Object, propertyName: string): void {
        registerDecorator({
            constraints: [ entityClass, entityPropertyName || propertyName ],
            name: "entityIsFound",
            options: validationOptions,
            propertyName: propertyName,
            target: object.constructor,
            validator: checkEntity()
        });
    };
}

export function IsEntityNotFound<T extends ObjectLiteral>(
    entityClass: EntityTarget<T>,
    entityPropertyName?: keyof T,
    validationOptions?: ValidationOptions
): Function {
    return function (object: Object, propertyName: string): void {
        registerDecorator({
            constraints: [ entityClass, entityPropertyName || propertyName, true ],
            name: "entityIsNotFound",
            options: validationOptions,
            propertyName: propertyName,
            target: object.constructor,
            validator: checkEntity()
        });
    };
}