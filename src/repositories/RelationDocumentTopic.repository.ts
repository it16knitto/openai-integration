import { EntityRepo } from '@knittotextile/knitto-mysql';

export default class RelationDocumentTopicRepository extends EntityRepo<Entity.RelationDocumentTopic> {
	tableName = 'relation_document_topic';
	async insert(data: Entity.RelationDocumentTopic): Promise<unknown> {
		return await super.insert(data);
	}
	async createMany(arrType: number[], idDocument: number): Promise<any> {
		const data: Entity.RelationDocumentTopic[] = [];
		for (const type of arrType) {
			data.push({
				document_id: idDocument,
				topic_id: type
			});
		}
		return await super.insertMany(data);
	}
}
