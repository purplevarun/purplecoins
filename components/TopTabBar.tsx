import { StyleSheet, TouchableOpacity, View } from "react-native";
import { MaterialTopTabBarProps } from "@react-navigation/material-top-tabs";
import { disabledColor, primaryColor, secondaryColor } from "../config/Colors";
import { HEADER_HEIGHT, TOP_TAB_HEIGHT } from "../config/Constants";
import MyText from "./MyText";

const TopTabBar = ({ state, navigation }: MaterialTopTabBarProps) => {
	return (
		<View style={styles.container}>
			{state.routes.map((route, index) => {
				const isFocused = state.index === index;
				return (
					<TouchableOpacity
						key={route.name}
						onPress={() => navigation.navigate(route.name)}
					>
						<MyText
							text={route.name}
							color={isFocused ? primaryColor : disabledColor}
						/>
					</TouchableOpacity>
				);
			})}
		</View>
	);
};
const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		justifyContent: "space-evenly",
		backgroundColor: secondaryColor,
		height: TOP_TAB_HEIGHT,
		alignItems: "center",
	},
});
export default TopTabBar;
