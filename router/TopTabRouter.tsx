import {
	createMaterialTopTabNavigator,
	MaterialTopTabBarProps,
} from "@react-navigation/material-top-tabs";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { secondaryColor, primaryColor, disabledColor } from "../config/Colors";
import { flex, TOP_TAB_HEIGHT } from "../config/Constants";
import AnalysisScreen from "../screens/finance/AnalysisScreen";
import CategoryScreen from "../screens/finance/CategoryScreen";
import TransactionScreen from "../screens/finance/RecordScreen";
import TripScreen from "../screens/finance/TripScreen";
import MyText from "../components/MyText";

const Routes = {
	Records: { page: TransactionScreen },
	Analysis: { page: AnalysisScreen },
	Categories: { page: CategoryScreen },
	Trips: { page: TripScreen },
};

const TopTabRouter = () => {
	const Tab = createMaterialTopTabNavigator();
	return (
		<View style={{ flex, backgroundColor: secondaryColor }}>
			<Tab.Navigator
				tabBarPosition="top"
				tabBar={(props) => <TopTabBar {...props} />}
			>
				{Object.entries(Routes).map(([name, { page }]) => (
					<Tab.Screen name={name} component={page} key={name} />
				))}
			</Tab.Navigator>
		</View>
	);
};

const TopTabBar = ({ state, navigation }: MaterialTopTabBarProps) => {
	return (
		<View style={styles.container}>
			{state.routes.map((route, index) => {
				const isFocused = state.index === index;
				const onPress = () => navigation.navigate(route.name);
				const color = isFocused ? primaryColor : disabledColor;
				return (
					<TouchableOpacity key={route.name} onPress={onPress}>
						<MyText text={route.name} color={color} />
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

export default TopTabRouter;
