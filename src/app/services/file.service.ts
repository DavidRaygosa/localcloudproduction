import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Global } from './global';
// MODELS
import { UploadFileModel } from '../model/fileModel/file.upload.model';
import { FileUpdateNameModel } from '../model/fileModel/file.update.file.model';
import { UploadFileDropModel } from '../model/fileModel/file.uploaddrop.model';
import { UploadTempFileModel } from '../model/fileModel/file.upload.temp';

@Injectable({
	providedIn: 'root'
})
export class FileService {
	public url: string;
	constructor(private _http: HttpClient) {
		this.url = Global.url;
	}
	getFiles(data:any){
		let headers = new HttpHeaders().set('Content-Type', 'application/json');
		return this._http.post(this.url + 'Discs', data, { headers: headers });
	}
	uploadFiles(data:UploadFileModel) {
		let date = JSON.stringify(data.lastmodifed);
		if(data.path=="") return this._http.post(this.url + 'Discs/uploadFiles/'+data.root+'/null'+'/'+date, data.files);
		else return this._http.post(this.url + 'Discs/uploadFiles/'+data.root+'/'+data.path+'/'+date, data.files);
	}
	uploadFilesDrop(data:UploadFileDropModel){
		if(data.path=="") return this._http.post(this.url + 'Discs/uploadFilesDrop/'+data.root+'/null'+'/'+data.index, data.files);
		else return this._http.post(this.url + 'Discs/uploadFilesDrop/'+data.root+'/'+data.path+'/'+data.index, data.files, { headers: new HttpHeaders({ timeout: `${3600000000}` }) });
	}
	uploadFileTemp(data:UploadTempFileModel){
		if(data.path=="") return this._http.post(this.url + 'Discs/tempFiles/'+data.root+'/null', data.files);
		else return this._http.post(this.url + 'Discs/tempFiles/'+data.root+'/'+data.path, data.files);
	}
	updateFile(data:FileUpdateNameModel){
		let headers = new HttpHeaders().set('Content-Type', 'application/json');
		return this._http.put(this.url + 'Discs', data, { headers: headers });
	}
	downloadFile(ID:string){
		let headers = new HttpHeaders();
		return this._http.get(this.url + 'Discs/download/'+ID, { headers: headers , observe: 'response', responseType: 'blob' });
	}
	createZip(data:any){
		let headers = new HttpHeaders().set('Content-Type', 'application/json');
		return this._http.post(this.url + 'Discs/createZip', data, { headers: headers });
	}
	downloadZip(ID:string){
		let headers = new HttpHeaders();
		return this._http.get(this.url + 'Discs/downloadZip/'+ID, { headers: headers , observe: 'response', responseType: 'blob' });
	}
	deleteFile(ID:string){
		let headers = new HttpHeaders().set('Content-Type', 'application/json');
		return this._http.delete(this.url + 'Discs/'+ID, { headers: headers });
	}
}