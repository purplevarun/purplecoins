import type Transaction from "@/types/Transaction";

type TransactionCardProps = Readonly<{
	transaction: Transaction;
	onPress: () => void;
	onLongPress?: () => void;
}>;

export type { TransactionCardProps as default };
