/*
	This component creates the Bottom Tab Router
	It contains - Finance, Passwords, TodoScreen and Settings
	This file also contains BottomTabBar component
*/

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import {
	disabledColor,
	primaryColor,
	secondaryColor,
} from "../config/colors.config";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { BOTTOM_TAB_HEIGHT, FONT_SIZE } from "../config/dimensions.config";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import ComponentText from "../components/Component.Text";
import ScreenFinance from "../screens/main/Screen.Finance";
import TodoScreen from "../screens/main/Screen.Todo";
import ScreenPassword from "../screens/main/Screen.Password";
import ScreenSettings from "../screens/main/Screen.Settings";

const Routes = {
	Finance: { page: ScreenFinance, icon: "indian-rupee-sign" },
	Passwords: { page: ScreenPassword, icon: "lock" },
	Todo: { page: TodoScreen, icon: "list-check" },
	Settings: { page: ScreenSettings, icon: "gear" },
};

const RouterBottom = () => {
	const Tab = createBottomTabNavigator();
	return (
		<Tab.Navigator
			screenOptions={{ headerShown: false }}
			tabBar={BottomTabBar}
		>
			{Object.entries(Routes).map(([name, { page }]) => (
				<Tab.Screen name={name} component={page} key={name} />
			))}
		</Tab.Navigator>
	);
};

const BottomTabBar = ({ state, navigation }: BottomTabBarProps) => {
	return (
		<View style={styles.view}>
			{state.routes.map((route, index) => {
				const isFocused = state.index === index;
				const color = isFocused ? primaryColor : disabledColor;
				const routeName = route.name as keyof typeof Routes;
				const iconName = Routes[routeName].icon;
				const onPress = () => navigation.navigate(route.name);
				return (
					<TouchableOpacity
						key={route.name}
						onPress={onPress}
						style={styles.btn}
					>
						<FontAwesome6
							name={iconName}
							size={FONT_SIZE}
							color={color}
						/>
						<ComponentText text={route.name} color={color} />
					</TouchableOpacity>
				);
			})}
		</View>
	);
};

const styles = StyleSheet.create({
	view: {
		backgroundColor: secondaryColor,
		height: BOTTOM_TAB_HEIGHT,
		flexDirection: "row",
		justifyContent: "space-evenly",
		alignItems: "center",
	},
	btn: { alignItems: "center" },
});

export default RouterBottom;
