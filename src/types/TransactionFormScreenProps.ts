import type RootStackParamList from "@/types/RootStackParamList";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

type TransactionFormScreenProps = NativeStackScreenProps<
	RootStackParamList,
	"TransactionForm"
>;

export type { TransactionFormScreenProps as default };
