import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import {
	DISABLED_COLOR,
	PRIMARY_COLOR,
	SECONDARY_COLOR,
} from "../config/colors.config";
import {
	BOTTOM_TAB_HEIGHT,
	CENTER,
	FLEX_ROW,
	FONT_SIZE,
	SPACE_EVENLY,
} from "../config/constants.config";
import BottomRoutes from "./BottomRoutes";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import CustomText from "../components/CustomText";

const BottomTabBar = ({ state, navigation }: BottomTabBarProps) => {
	return (
		<View style={styles.view}>
			{state.routes.map((route, index) => {
				const isFocused = state.index === index;
				const color = isFocused ? PRIMARY_COLOR : DISABLED_COLOR;
				const routeName = route.name as keyof typeof BottomRoutes;
				const iconName = BottomRoutes[routeName].icon;
				const onPress = () => navigation.navigate(route.name);
				return (
					<TouchableOpacity
						key={route.name}
						onPress={onPress}
						style={styles.button}
					>
						<FontAwesome6
							name={iconName}
							size={FONT_SIZE}
							color={color}
						/>
						<CustomText text={route.name} color={color} />
					</TouchableOpacity>
				);
			})}
		</View>
	);
};

const styles = StyleSheet.create({
	view: {
		backgroundColor: SECONDARY_COLOR,
		height: BOTTOM_TAB_HEIGHT,
		flexDirection: FLEX_ROW,
		justifyContent: SPACE_EVENLY,
		alignItems: CENTER,
	},
	button: { alignItems: CENTER },
});

export default BottomTabBar;
