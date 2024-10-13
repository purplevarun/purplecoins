import {
	createMaterialTopTabNavigator,
	MaterialTopTabBarProps,
} from "@react-navigation/material-top-tabs";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import {
	secondaryColor,
	primaryColor,
	disabledColor,
} from "../config/colors.config";
import { SMALL_FONT_SIZE, TOP_TAB_HEIGHT } from "../config/dimensions.config";
import { flex } from "../config/style.config";
import ScreenFinanceAnalysisMain from "../screens/finance/analysis/Screen.Finance.Analysis.Main";
import ScreenFinanceCategoryMain from "../screens/finance/category/Screen.Finance.Category.Main";
import ScreenFinanceTripMain from "../screens/finance/trip/Screen.Finance.Trip.Main";
import ComponentText from "../components/Component.Text";
import ScreenFinanceTransactionRouter from "../screens/finance/transaction/Screen.Finance.Transaction.Router";

const Routes = {
	Transactions: { page: ScreenFinanceTransactionRouter },
	Analysis: { page: ScreenFinanceAnalysisMain },
	Categories: { page: ScreenFinanceCategoryMain },
	Trips: { page: ScreenFinanceTripMain },
};

const RouterTop = () => {
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
						<ComponentText
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
		backgroundColor: secondaryColor,
		height: TOP_TAB_HEIGHT,
		alignItems: "center",
	},
});

export default RouterTop;
