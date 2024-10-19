import { StyleSheet, TouchableOpacity, View } from "react-native";
import { PRIMARY_COLOR, SECONDARY_COLOR } from "../config/colors.config";
import { HEADER_HEIGHT, HEADER_ICON_SIZE } from "../config/dimensions.config";
import { PADDING } from "../config/dimensions.config";
import CustomText from "./CustomText";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import app from "./../app.json";

const Header = () => {
	return (
		<View style={styles.container}>
			<CustomText text={app.expo.name} fontSize={HEADER_ICON_SIZE} />
			<TouchableOpacity>
				<FontAwesome5
					name="user-alt"
					size={HEADER_ICON_SIZE}
					color={PRIMARY_COLOR}
				/>
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		backgroundColor: SECONDARY_COLOR,
		height: HEADER_HEIGHT,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: PADDING,
	},
});

export default Header;
