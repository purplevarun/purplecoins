type TextFieldProps = Readonly<{
	label: string;
	value: string;
	onChangeText: (value: string) => void;
	placeholder?: string;
	keyboardType?: "default" | "decimal-pad" | "number-pad" | "url";
	isMultiline?: boolean;
	isSecure?: boolean;
	isEditable?: boolean;
	autoCapitalize?: "none" | "sentences" | "words" | "characters";
}>;

export type { TextFieldProps as default };
