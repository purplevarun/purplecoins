import { ActivityIndicator, StatusBar, View } from "react-native";
import { primaryColor, secondaryColor } from "../../../config/Colors";

const LoadingScreen = () => {
	return (
		<View
			style={{
				flex: 1,
				justifyContent: "center",
				alignItems: "center",
				backgroundColor: secondaryColor,
			}}
		>
			<StatusBar backgroundColor={secondaryColor} />
			<ActivityIndicator color={primaryColor} size={200} />
		</View>
	);
};
export default LoadingScreen;
