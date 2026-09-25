import type RootStackParamList from "@/types/RootStackParamList";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

type InvestmentsScreenProps = NativeStackScreenProps<
	RootStackParamList,
	"Investments"
>;

export type { InvestmentsScreenProps as default };
