type SummaryMetricInput = Readonly<{
	label: string;
	value: string;
	accent: "success" | "danger" | "warning" | "default";
	color: string;
}>;

export type { SummaryMetricInput as default };
