export class DiskModel {
	constructor
		(
			public driverName: string,
			public volumeLabel: string,
			public freeSpace: number,
            public totalSize: number,
			public tag: string
	) {
	}
}