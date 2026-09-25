import type RootStackParamList from "@/types/RootStackParamList";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

type GlobalSearchScreenProps = NativeStackScreenProps<
	RootStackParamList,
	"GlobalSearch"
>;

export type { GlobalSearchScreenProps as default };
