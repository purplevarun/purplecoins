import type { ReactElement } from "react";
import type { Mock } from "vitest";

type TransactionFormHarness = Readonly<{
	render: () => ReactElement;
	values: Map<number, unknown>;
	navigation: Readonly<{ goBack: Mock }>;
}>;

export type { TransactionFormHarness as default };
