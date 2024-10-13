/*
	This is the ComponentHeader component
	It is a standalone component
	It does not handle any routing
*/

import { StyleSheet, TouchableOpacity, View } from "react-native";
import { headerColor, primaryColor } from "../config/colors.config";
import { HEADER_HEIGHT, HEADER_ICON_SIZE } from "../config/dimensions.config";
import { padding } from "../config/style.config";
import ComponentText from "./Component.Text";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import app from "./../app.json";

const ComponentHeader = () => {
	return (
		<View style={styles.container}>
			<ComponentText text={app.expo.name} fontSize={HEADER_ICON_SIZE} />
			<TouchableOpacity>
				<FontAwesome5
					name="user-alt"
					size={HEADER_ICON_SIZE}
					color={primaryColor}
				/>
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		backgroundColor: headerColor,
		height: HEADER_HEIGHT,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: padding,
	},
});

export default ComponentHeader;
