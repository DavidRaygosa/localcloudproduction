export class UserRegisterModel {
	constructor
		(
			public name: string,
			public lastName: string,
			public email: string,
			public password: string,
			public username: string,
			public Language: string,
			public isdark: boolean,
			public image: string
	) {
	}
}