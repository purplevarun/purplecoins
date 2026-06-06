type AttachmentInput = Readonly<{
	fileName: string;
	mimeType: string;
	sizeBytes: number;
	content: Uint8Array;
}>;

export type { AttachmentInput };
