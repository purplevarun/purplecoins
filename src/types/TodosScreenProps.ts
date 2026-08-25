import type RootStackParamList from "@/types/RootStackParamList";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

type TodosScreenProps = NativeStackScreenProps<RootStackParamList, "Todos">;

export type { TodosScreenProps as default };
