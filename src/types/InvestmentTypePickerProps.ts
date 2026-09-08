import type InvestmentType from "@/types/InvestmentType";

type InvestmentTypePickerProps = Readonly<{
	value: string;
	investmentTypes: readonly InvestmentType[];
	onChange: (value: string) => void;
	onCreateInvestmentType: (name: string) => Promise<string>;
}>;

export type { InvestmentTypePickerProps as default };
