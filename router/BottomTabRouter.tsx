import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { disabledColor, primaryColor, secondaryColor } from "../config/Colors";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { BOTTOM_TAB_HEIGHT, FONT_SIZE } from "./../config/Constants";
import MyText from "../components/MyText";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import FinanceScreen from "../screens/main/FinanceScreen";
import TodoScreen from "../screens/main/NoteScreen";
import PasswordScreen from "../screens/main/PasswordScreen";
import SettingScreen from "../screens/main/SettingScreen";
import "../config/Constants";

const Routes = {
	Finance: { page: FinanceScreen, icon: "indian-rupee-sign" },
	Passwords: { page: PasswordScreen, icon: "lock" },
	Todo: { page: TodoScreen, icon: "list-check" },
	Settings: { page: SettingScreen, icon: "gear" },
};

const BottomTabRouter = () => {
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

export default BottomTabRouter;
