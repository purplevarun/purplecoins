import {
	Platform,
	StyleSheet,
	type StyleProp,
	type TextStyle,
} from "react-native";

import { FONT_FAMILY } from "@/constants/typography";

const applyAppFontStyle = (style?: StyleProp<TextStyle>): TextStyle => {
	const merged: TextStyle = {
		fontFamily: FONT_FAMILY,
		...StyleSheet.flatten(style),
	};

	if (Platform.OS === "android") {
		delete merged.fontWeight;
	}

	return merged;
};

export { applyAppFontStyle };
