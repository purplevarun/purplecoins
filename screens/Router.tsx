import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import {
	DISABLED_COLOR,
	PRIMARY_COLOR,
	SECONDARY_COLOR,
} from "../config/colors.config";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { BOTTOM_TAB_HEIGHT, FONT_SIZE } from "../config/dimensions.config";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import CustomText from "../components/CustomText";
import TodoScreen from "./main/TodoScreen";
import PasswordScreen from "./main/PasswordScreen";
import SettingsScreen from "./main/SettingsScreen";
import FinanceRouter from "./finance/FinanceRouter";

const Routes = {
	Finance: { page: FinanceRouter, icon: "indian-rupee-sign" },
	Passwords: { page: PasswordScreen, icon: "lock" },
	Todo: { page: TodoScreen, icon: "list-check" },
	Settings: { page: SettingsScreen, icon: "gear" },
};

const Router = () => {
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
				const color = isFocused ? PRIMARY_COLOR : DISABLED_COLOR;
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
		flexDirection: "row",
		justifyContent: "space-evenly",
		alignItems: "center",
	},
	btn: { alignItems: "center" },
});

export default Router;
