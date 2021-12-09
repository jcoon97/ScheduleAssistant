import { ObjectType } from "type-graphql";
import { BaseUserPayload } from "./BaseUserPayload";

@ObjectType({ description: "Return type for `userElevateRole` mutation." })
export class ElevateUserRolePayload extends BaseUserPayload {

}