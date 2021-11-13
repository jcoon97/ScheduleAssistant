import { ExecutionResult, graphql, GraphQLSchema } from "graphql";
import { Maybe } from "type-graphql";
import { Context } from "../../src/context";
import { Server } from "../../src/Server";

export interface GraphQLTestContext extends Partial<Omit<Context, "req">> {

}

export interface GraphQLTestOptions {
    context?: GraphQLTestContext,
    source: string,
    variables?: Maybe<{
        [key: string]: any;
    }>;
}

let schema: GraphQLSchema;

export async function gqlTest(options: GraphQLTestOptions): Promise<ExecutionResult> {
    if (!schema) {
        schema = await Server.buildSchema();
    }

    return graphql({
        contextValue: {
            ...options.context
        },
        schema,
        source: <string>options.source,
        variableValues: options.variables
    });
}