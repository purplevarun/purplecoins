import {
	createMaterialTopTabNavigator,
	MaterialTopTabBarProps,
} from "@react-navigation/material-top-tabs";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import {
	SECONDARY_COLOR,
	PRIMARY_COLOR,
	DISABLED_COLOR,
} from "../../config/colors.config";
import {
	SMALL_FONT_SIZE,
	TOP_TAB_HEIGHT,
} from "../../config/dimensions.config";
import { FLEX } from "../../config/dimensions.config";
import AnalysisScreen from "./analysis/AnalysisScreen";
import ScreenFinanceTripMain from "./trip/Screen.Finance.Trip.Main";
import CustomText from "../../components/CustomText";
import TransactionRouter from "./transaction/TransactionRouter";
import CategoryRouter from "./category/CategoryRouter";

const Routes = {
	Transactions: { page: TransactionRouter },
	Analysis: { page: AnalysisScreen },
	Categories: { page: CategoryRouter },
	Trips: { page: ScreenFinanceTripMain },
};

const FinanceRouter = () => {
	const Tab = createMaterialTopTabNavigator();
	return (
		<View style={{ flex: FLEX, backgroundColor: SECONDARY_COLOR }}>
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
				const color = isFocused ? PRIMARY_COLOR : DISABLED_COLOR;
				return (
					<TouchableOpacity key={route.name} onPress={onPress}>
						<CustomText
							text={route.name}
							color={color}
							fontSize={SMALL_FONT_SIZE}
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
		backgroundColor: SECONDARY_COLOR,
		height: TOP_TAB_HEIGHT,
		alignItems: "center",
	},
});

export default FinanceRouter;
