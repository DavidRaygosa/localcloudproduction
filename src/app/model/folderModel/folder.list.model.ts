import { FolderCreateModel } from './folder.create.model';
export class FolderListModel {
	constructor
		(
			public FolderList: Array<FolderCreateModel>
	) {
	}
}