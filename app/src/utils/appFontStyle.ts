import typographyConstants from "@/constants/typography";

import {
	Platform,
	StyleSheet,
	type StyleProp,
	type TextStyle,
} from "react-native";

const { FONT_FAMILY } = typographyConstants;
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

export default applyAppFontStyle;
