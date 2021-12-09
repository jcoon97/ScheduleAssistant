import { ObjectType } from "type-graphql";
import { BaseUserPayload } from "./BaseUserPayload";

@ObjectType({ description: "Return type for `userCreate` mutation." })
export class CreateUserPayload extends BaseUserPayload {

}