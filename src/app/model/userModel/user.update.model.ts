export class UserUpdateModel {
	constructor
		(
            public FullName: string,
			public isDark: boolean,
			public Language: string,
			public CurrentPassword: string,
            public Password: string,
			public firstLogin: boolean
	) {
	}
}