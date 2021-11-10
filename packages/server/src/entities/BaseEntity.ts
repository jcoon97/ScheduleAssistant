import { Field, ID, InterfaceType } from "type-graphql";
import { CreateDateColumn, DeleteDateColumn, ObjectLiteral, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export type Lazy<T extends ObjectLiteral> = Promise<T> | T;

@InterfaceType("Node")
export abstract class BaseEntity {
    @Field(() => ID, { description: "A globally-unique identifier." })
    @PrimaryGeneratedColumn({ name: "id" })
    readonly id!: number;

    @CreateDateColumn({ name: "created_date" })
    @Field(() => Date, {
        description: "The DateTime that the node was created, in ISO 8601 format."
    })
    readonly createdDate!: Date;

    @DeleteDateColumn({ name: "deleted_date" })
    readonly deletedDate?: Date;

    @Field(() => Date, {
        description: "The DateTime that the node was last updated, in ISO 8601 format."
    })
    @UpdateDateColumn({ name: "updated_date" })
    readonly updatedDate!: Date;
}