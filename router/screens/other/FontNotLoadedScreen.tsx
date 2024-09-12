import { StatusBar, View } from "react-native";
import { backgroundColor, secondaryColor } from "../../../config/Colors";
import MyText from "../../../components/MyText";
import { flex } from "../../../config/Constants";
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
			<MyText text={"Font not loaded"} useFont={false} />
		</View>
	);
};
export default FontNotLoadedScreen;
