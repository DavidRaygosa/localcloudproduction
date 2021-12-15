export class DataFileModel {
	constructor
		(
			public fileID: string,
			public fileName: string,
            public fileSize: string,
			public fileType: string,
			public logo: string,
            public fileCreatedDate: any,
            public fileUpdatedDate: any,
            public fullPath: string,
			public savedDisk: string,
            public fullName: string,
			public image: string
	) {
	}
}