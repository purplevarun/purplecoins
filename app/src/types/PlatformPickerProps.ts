import type Platform from "@/types/Platform";

type PlatformPickerProps = Readonly<{
	platforms: readonly Platform[];
	value?: string | null;
	onValueChange: (id: string | null) => void;
	placeholder?: string;
}>;

export type { PlatformPickerProps as default };
