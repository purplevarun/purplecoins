import { ActivityIndicator, StatusBar, View } from "react-native";
import { primaryColor, secondaryColor } from "../../config/Colors";
import { flex, LOADER_SIZE } from "../../config/Constants";

const LoadingScreen = () => {
	return (
		<View
			style={{
				flex,
				justifyContent: "center",
				alignItems: "center",
				backgroundColor: secondaryColor,
			}}
		>
			<StatusBar backgroundColor={secondaryColor} />
			<ActivityIndicator color={primaryColor} size={LOADER_SIZE} />
		</View>
	);
};
export default LoadingScreen;
