import type RootStackParamList from "@/types/RootStackParamList";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

type NoteFormScreenProps = NativeStackScreenProps<
	RootStackParamList,
	"NoteForm"
>;

export type { NoteFormScreenProps as default };
