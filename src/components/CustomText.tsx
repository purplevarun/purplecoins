import { Text as RNText, type TextProps } from "react-native";

import { applyAppFontStyle } from "@/utils/appFontStyle";

const CustomText = ({ style, ...props }: TextProps): React.JSX.Element => (
	<RNText style={applyAppFontStyle(style)} {...props} />
);

export { CustomText };
