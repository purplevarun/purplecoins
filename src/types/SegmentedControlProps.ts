import type SelectOption from "@/types/SelectOption";

type SegmentedControlProps = Readonly<{
	value: string;
	options: readonly SelectOption[];
	onChange: (value: string) => void;
}>;

export type { SegmentedControlProps as default };
