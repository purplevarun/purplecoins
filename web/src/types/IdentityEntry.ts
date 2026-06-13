type IdentityEntry = Readonly<{
	id: string;
	title: string;
	idNumber: string;
	notes: string;
	createdAt: number;
	updatedAt: number;
	hasAttachment: boolean;
}>;

export type { IdentityEntry };
