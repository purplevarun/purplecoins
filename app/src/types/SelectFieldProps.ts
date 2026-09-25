import type SelectOption from "@/types/SelectOption";

type SelectFieldProps = Readonly<{
	label: string;
	value: string;
	options: readonly SelectOption[];
	onChange: (value: string) => void;
	placeholder?: string;
	isOptional?: boolean;
}>;

export type { SelectFieldProps as default };
