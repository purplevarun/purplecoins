type CopyRowProps = Readonly<{
	label: string;
	value: string;
	onCopy: (value: string, label: string) => void;
}>;

export type { CopyRowProps as default };
