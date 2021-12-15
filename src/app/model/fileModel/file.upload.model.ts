export class UploadFileModel {
	constructor
		(
			public root: string,
            public path: string,
			public lastmodifed: Array<string>,
            public files: FormData
	) {
	}
}