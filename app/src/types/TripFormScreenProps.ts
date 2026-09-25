import type RootStackParamList from "@/types/RootStackParamList";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

type TripFormScreenProps = NativeStackScreenProps<
	RootStackParamList,
	"TripForm"
>;

export type { TripFormScreenProps as default };
