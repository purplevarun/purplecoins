type SearchBarProps = Readonly<{
	value: string;
	onChangeText: (text: string) => void;
	placeholder?: string;
	autoFocus?: boolean;
}>;

export type { SearchBarProps as default };
