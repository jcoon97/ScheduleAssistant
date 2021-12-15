import { DeepPartial, FindConditions, ObjectLiteral, Repository } from "typeorm";

export class BaseRepository<T extends ObjectLiteral> extends Repository<T> {
    /**
     * <p>Attempts to find the entity based on the specified `findConditions`. If an entity was found, then
     * the entity will update with any new data present in `upsertOptions`; if the entity was not found,
     * then the entity will be created with the data present in `upsertOptions`.</p>
     *
     * <p>In each instance, once the data has been saved to the database either because it was created or
     * because it was updated, the saved entity will be returned to the calling function.</p>
     */
    async findOneOrUpsert(findConditions: FindConditions<T>, upsertOptions: DeepPartial<T>): Promise<T> {
        const foundEntity: T | undefined = await this.findOne(findConditions);

        if (foundEntity) {
            const { id: _, ...restUpsert } = upsertOptions; // Use spread operator to omit `id` property
            const options = { id: foundEntity.id as string, ...restUpsert } as DeepPartial<T>;
            return this.save(options);
        } else {
            const newEntity: T = this.create(upsertOptions);
            return this.save(newEntity);
        }
    }
}