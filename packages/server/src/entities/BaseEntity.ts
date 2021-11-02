import { Field, ID, ObjectType } from "type-graphql";
import { CreateDateColumn, DeleteDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@ObjectType()
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