export class UploadFileDropModel {
	constructor
		(
			public root: string,
			public path: string,
            public files: FormData,
			public index: number
	) {
	}
}