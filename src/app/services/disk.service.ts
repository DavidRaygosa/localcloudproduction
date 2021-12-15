import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Global } from './global';
// MODELS
import { FolderListModel } from '../model/folderModel/folder.list.model';

@Injectable({
	providedIn: 'root'
})
export class DiskService {
	public url: string;
	constructor(private _http: HttpClient) {
		this.url = Global.url;
	}
	disklist() {
		let headers = new HttpHeaders().set('Content-Type', 'application/json');
		return this._http.get(this.url + 'Discs', { headers: headers });
	}
	createFolder(data:FolderListModel){
		return this._http.post(this.url + 'Discs/folder', data);
	}
}