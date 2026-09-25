import type SelectOption from "@/types/SelectOption";

type SegmentedControlProps = Readonly<{
	value: string;
	options: readonly SelectOption[];
	onChange: (value: string) => void;
	labelNumberOfLines?: number;
}>;

export type { SegmentedControlProps as default };
