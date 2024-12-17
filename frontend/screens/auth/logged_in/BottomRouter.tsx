import {
	BottomTabBarProps,
	BottomTabNavigationOptions,
	createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";
import {
	BOTTOM_TAB_HEIGHT,
	CENTER,
	FLEX_ROW,
	FONT_SIZE,
	SCREEN_OPTIONS,
	SPACE_EVENLY,
} from "../../../config/constants.config";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import {
	DISABLED_COLOR,
	PRIMARY_COLOR,
	SECONDARY_COLOR,
} from "../../../config/colors.config";
import {
	FINANCE_ICON,
	PASSWORDS_ICON,
	SETTINGS_ICON,
	TODO_ICON,
} from "../../../config/icons.config";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import CustomText from "../../../components/CustomText";
import FinanceRouter from "../../finance/router/FinanceRouter";
import PasswordScreen from "../../main/PasswordScreen";
import TodoScreen from "../../main/TodoScreen";
import SettingsScreen from "../../main/SettingsScreen";

const BottomRoutes = {
	Finance: { page: FinanceRouter, icon: FINANCE_ICON },
	Passwords: { page: PasswordScreen, icon: PASSWORDS_ICON },
	Todo: { page: TodoScreen, icon: TODO_ICON },
	Settings: { page: SettingsScreen, icon: SETTINGS_ICON },
};

const BottomRouter = () => {
	const Tab = createBottomTabNavigator();
	return (
		<Tab.Navigator
			screenOptions={SCREEN_OPTIONS as BottomTabNavigationOptions}
			tabBar={BottomTabBar}
		>
			{Object.entries(BottomRoutes).map(([name, { page }]) => (
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

export default BottomRouter;
