import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Global } from './global';
// MODELS
import { FolderUpdateNameModel } from '../model/folderModel/folder.update.model'; 

@Injectable({
	providedIn: 'root'
})
export class FolderService {
	public url: string;
	constructor(private _http: HttpClient) {
		this.url = Global.url;
	}
	uploadFolder(data:FolderUpdateNameModel) {
		let headers = new HttpHeaders().set('Content-Type', 'application/json');
		return this._http.post(this.url + 'Discs/updateFolder', data, { headers: headers });
	}
	deteleFolder(data:any){
		let headers = new HttpHeaders().set('Content-Type', 'application/json');
		return this._http.post(this.url + 'Discs/deleteDirectory', data, { headers: headers });
	}
}