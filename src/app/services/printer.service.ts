import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Global } from './global';

@Injectable({
	providedIn: 'root'
})
export class PrinterService {
	public url: string;
	constructor(private _http: HttpClient) {
		this.url = Global.url;
	}
	getPrinter(){
		let headers = new HttpHeaders().set('Content-Type', 'application/json');
		return this._http.get(this.url + 'Printer', { headers: headers });
	}
    print(data:any){
		let headers = new HttpHeaders().set('Content-Type', 'application/json');
		return this._http.post(this.url + 'Printer', data, { headers: headers });
    }
}