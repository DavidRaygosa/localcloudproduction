export class UploadTempFileModel {
	constructor
		(
			public root: string,
            public path: string,
            public files: FormData
	) {
	}
}