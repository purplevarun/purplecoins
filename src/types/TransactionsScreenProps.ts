import type RootStackParamList from "@/types/RootStackParamList";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

type TransactionsScreenProps = NativeStackScreenProps<
	RootStackParamList,
	"Transactions"
>;

export type { TransactionsScreenProps as default };
