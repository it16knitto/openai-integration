import { EntityRepo } from '@knittotextile/knitto-mysql';

export default class DocumentRepository extends EntityRepo<Entity.Document> {
	tableName = 'document';
	async insert(data: Entity.Document): Promise<unknown> {
		return await super.insert(data);
	}
}
