import { Field, ID, InterfaceType } from "type-graphql";
import { CreateDateColumn, DeleteDateColumn, ObjectLiteral, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export type Lazy<T extends ObjectLiteral> = Promise<T> | T;

@InterfaceType("Node")
export abstract class BaseEntity {
    @Field(() => ID)
    @PrimaryGeneratedColumn({ name: "id" })
    readonly id!: number;

    @CreateDateColumn({ name: "created_date" })
    @Field(() => Date)
    readonly createdDate!: Date;

    @DeleteDateColumn({ name: "deleted_date" })
    @Field(() => Date, { nullable: true })
    readonly deletedDate?: Date;

    @Field(() => Date)
    @UpdateDateColumn({ name: "updated_date" })
    readonly updatedDate!: Date;
}