interface AttachmentViewerProps {
	uri: string | null;
	fileName: string;
	mimeType?: string;
	onClose: () => void;
}

export type { AttachmentViewerProps as default };
