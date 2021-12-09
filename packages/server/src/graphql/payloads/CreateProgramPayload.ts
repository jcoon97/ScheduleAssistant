import { ObjectType } from "type-graphql";
import { BaseProgramPayload } from "./BaseProgramPayload";

@ObjectType({ description: "Return type for `programCreate` mutation." })
export class CreateProgramPayload extends BaseProgramPayload {

}