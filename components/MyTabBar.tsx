import { StyleSheet, TouchableOpacity, View } from "react-native";
import { MaterialTopTabBarProps } from "@react-navigation/material-top-tabs";
import { primaryColor, secondaryColor } from "../config/Colors";
import MyText from "./MyText";

const MyTabBar = ({ state, navigation }: MaterialTopTabBarProps) => {
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
							header
							text={route.name}
							color={isFocused ? primaryColor : "#2A3342"}
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
		justifyContent: "space-between",
		backgroundColor: secondaryColor,
		height: 40,
		alignItems: "center",
		paddingHorizontal: 20,
	},
});
export default MyTabBar;
