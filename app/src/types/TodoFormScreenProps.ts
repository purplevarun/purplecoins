import type RootStackParamList from "@/types/RootStackParamList";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

type TodoFormScreenProps = NativeStackScreenProps<
	RootStackParamList,
	"TodoForm"
>;

export type { TodoFormScreenProps as default };
