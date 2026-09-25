import type { PressableStateCallbackType } from "react-native";

type ActionProps = Readonly<{
	accessibilityLabel: string;
	onPress: () => void;
	style: (state: PressableStateCallbackType) => unknown;
}>;

export type { ActionProps as default };
