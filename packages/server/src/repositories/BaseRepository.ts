import { DeepPartial, FindConditions, ObjectLiteral, Repository } from "typeorm";

export class BaseRepository<Entity extends ObjectLiteral> extends Repository<Entity> {
    /**
     * Attempts to find an entity based on the `findConditions` specified. If one was found, then it
     * is returned immediately; if one was not found, then it is instead created using the `insertOptions`
     * specified, saved to the database, and then returned
     */
    async findOneOrCreate(findConditions: FindConditions<Entity>, insertOptions: DeepPartial<Entity>): Promise<Entity> {
        const foundEntity: Entity | undefined = await this.findOne(findConditions);
        if (foundEntity) return foundEntity;

        const newEntity: Entity = this.create(insertOptions);
        return await this.save(newEntity);
    }
}