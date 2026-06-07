import { TextInput as RNTextInput, type TextInputProps } from "react-native";

import { applyAppFontStyle } from "@/utils/appFontStyle";

const CustomTextInput = ({
	style,
	...props
}: TextInputProps): React.JSX.Element => (
	<RNTextInput style={applyAppFontStyle(style)} {...props} />
);

export { CustomTextInput };
