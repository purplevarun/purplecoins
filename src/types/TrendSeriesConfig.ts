import type TrendSeriesKey from "@/types/TrendSeriesKey";

type TrendSeriesConfig = Readonly<{
	key: TrendSeriesKey;
	label: string;
	color: string;
}>;

export type { TrendSeriesConfig as default };
