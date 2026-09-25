type AppRelease = Readonly<{
	version: string;
	name: string;
	downloadUrl: string;
	size: number;
}>;

export type { AppRelease as default };
