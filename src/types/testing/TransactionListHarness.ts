import type HeaderButton from "@/types/testing/HeaderButton";
import type { ReactElement } from "react";

type TransactionListHarness = Readonly<{
	render: () => ReactElement;
	reload: () => void;
	unmount: () => void;
	headerButtons: () => HeaderButton[];
	setState: (index: number, value: unknown) => void;
}>;

export type { TransactionListHarness as default };
