import { DataFileModel } from './data.files.model';
import { DataFoldersModel } from './data.folders.model';
export class DataModel {
	constructor
		(
			public files: Array<DataFileModel>,
            public folders: Array<DataFoldersModel>
	) {
	}
}