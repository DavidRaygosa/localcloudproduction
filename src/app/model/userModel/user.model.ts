import { LangsModel } from '../../model/langModel/langs.model';
export class UserModel {
	constructor
		(
			public id: string,
			public fullName: string,
			public token: string,
			public tokenEncrypted: string,
			public email: string,
			public username: string,
			public image: any,
			public isDark: boolean,
			public language: string,
			public languageImage: LangsModel,
			public firstLogin: boolean
	) {
	}
}