type PasswordEntry = Readonly<{
	id: string;
	title: string;
	username: string;
	password: string;
	website: string;
	notes: string;
	createdAt: number;
	updatedAt: number;
}>;

export type { PasswordEntry as default };
