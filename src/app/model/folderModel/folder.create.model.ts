export class FolderCreateModel {
	constructor
		(
			public root: string,
			public foldername: string,
			public path: string,
			public isDrop: boolean
	) {
	}
}