import { StyleSheet, TouchableOpacity, View } from "react-native";
import { MaterialTopTabBarProps } from "@react-navigation/material-top-tabs";
import { secondaryColor } from "../config/Colors";
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
							text={route.name}
							color={isFocused ? "white" : "grey"}
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
		height: 40,
		alignItems: "center",
	},
});
export default MyTabBar;
