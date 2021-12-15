import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { from, Observable } from 'rxjs';
import { Global } from './global';
// MODELS
import { UserLoginModel } from '../model/userModel/user.login.model'
import { UserRegisterModel } from '../model/userModel/user.register.model'
import { UpdatePhotoModel } from '../model/fileModel/file.updatePhoto.model';
import { UserUpdateModel } from '../model/userModel/user.update.model';

@Injectable({
	providedIn: 'root'
})
export class UserService {
	public url: string;
	constructor(private _http: HttpClient) {
		this.url = Global.url;
	}
	login(data:UserLoginModel) {
		let headers = new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8');
		return this._http.post(this.url + 'User/login', data, { headers: headers });
	}
	register(data:UserRegisterModel){
		let headers = new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8');
		return this._http.post(this.url + 'User', data, { headers: headers });
	}
	updateUser(data:UserUpdateModel){
		let headers = new HttpHeaders().set('Content-Type', 'application/json');
		return this._http.put(this.url + 'User', data, { headers: headers });
	}
	allUser(){
		let headers = new HttpHeaders().set('Content-Type', 'application/json');
		return this._http.get(this.url + 'User/allUsers', { headers: headers });
	}
	session(remember:boolean){
		let data ={isRemember: remember};
		let headers = new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8');
		return this._http.post(this.url + 'User/currentUser', data, { headers: headers });
	}
	uploadImage(data:UpdatePhotoModel){
		let headers = new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8');
		return this._http.post(this.url + 'Document', data, { headers: headers });
	}
	getTokenDescrypt(tokenEncrypt:string){
		let data ={
			tokenEncrypted: tokenEncrypt
		};
		let headers = new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8');
		return this._http.post(this.url + 'User/tokenEncrypt', data, { headers: headers });
	}
}