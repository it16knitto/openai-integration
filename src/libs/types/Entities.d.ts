declare namespace Entity {
	interface Document {
		id?: number;
		filename?: string;
		hash_file?: string;
		parse_text?: string;
	}
	interface RelationDocumentTopic {
		document_id?: number;
		topic_id?: number;
	}
	interface Topic {
		id?: number;
		name?: string;
	}
}
