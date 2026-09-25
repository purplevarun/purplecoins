import type ChartDatum from "@/types/ChartDatum";

type DonutChartProps = Readonly<{
	data: readonly ChartDatum[];
	centerLabel: string;
}>;

export type { DonutChartProps as default };
