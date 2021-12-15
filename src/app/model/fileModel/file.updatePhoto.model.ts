export class UpdatePhotoModel {
	constructor
		(
			public ObjectReference: string,
			public Data: string,
            public Name: string,
            public Extension: string,
			public DataReferences: string,
	) {
	}
}