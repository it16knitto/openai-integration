import { EntityRepo } from '@knittotextile/knitto-mysql';

export default class TopicRepository extends EntityRepo<Entity.Topic> {
	tableName = 'topic';
	async findAll(): Promise<any[]> {
		return await this.dbConnector.raw('SELECT * FROM topic order by name asc');
	}
}
