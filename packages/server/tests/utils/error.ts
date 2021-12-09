import { UserError } from "../../src/graphql/errors/UserError";

export function errorContainsField(array: UserError[], field: string): boolean {
    return array.some(
        (value: UserError) => value.field?.includes(field)
    );
}