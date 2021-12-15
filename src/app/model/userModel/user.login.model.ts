export class UserLoginModel {
	constructor
		(
			public email: string,
			public password: string,
			public isRemember: boolean
	) {
	}
}