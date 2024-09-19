import { StatusBar, View, Text } from "react-native";
import { backgroundColor, secondaryColor } from "../../config/Colors";
import { flex } from "../../config/Constants";
const FontNotLoadedScreen = () => {
	return (
		<View
			style={{
				flex,
				backgroundColor: backgroundColor,
				justifyContent: "center",
				alignItems: "center",
			}}
		>
			<StatusBar backgroundColor={secondaryColor} />
			<Text>Font not loaded</Text>
		</View>
	);
};
export default FontNotLoadedScreen;
