import { View, TouchableOpacity, StyleSheet } from "react-native";
import { disabledColor, primaryColor, secondaryColor } from "../config/Colors";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { BOTTOM_TAB_HEIGHT, FONT_SIZE } from "./../config/Constants";
import BottomTabRoutes from "./BottomTabRoutes";
import MyText from "../components/MyText";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import "./../config/Constants";

const BottomTabBar = ({ state, navigation }: BottomTabBarProps) => {
	return (
		<View style={styles.view}>
			{state.routes.map((route, index) => {
				const isFocused = state.index === index;
				const color = isFocused ? primaryColor : disabledColor;
				const routeName = route.name as keyof typeof BottomTabRoutes;
				const iconName = BottomTabRoutes[routeName].icon;
				return (
					<TouchableOpacity
						key={route.name}
						onPress={() => navigation.navigate(route.name)}
						style={styles.btn}
					>
						<FontAwesome6
							name={iconName}
							size={FONT_SIZE}
							color={color}
						/>
						<MyText text={route.name} color={color} />
					</TouchableOpacity>
				);
			})}
		</View>
	);
};
const styles = StyleSheet.create({
	view: {
		flexDirection: "row",
		justifyContent: "space-evenly",
		backgroundColor: secondaryColor,
		height: BOTTOM_TAB_HEIGHT,
		alignItems: "center",
	},
	btn: { alignItems: "center" },
});
export default BottomTabBar;
