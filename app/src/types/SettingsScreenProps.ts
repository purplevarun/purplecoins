import type RootStackParamList from "@/types/RootStackParamList";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

type SettingsScreenProps = NativeStackScreenProps<
	RootStackParamList,
	"Settings"
>;

export type { SettingsScreenProps as default };
