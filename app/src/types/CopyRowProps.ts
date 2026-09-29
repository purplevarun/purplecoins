type CopyRowProps = Readonly<{
	label: string;
	value: string;
	isMasked?: boolean;
	onCopy?: (value: string, label: string) => void;
}>;

export type { CopyRowProps as default };
