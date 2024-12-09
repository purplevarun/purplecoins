import { createMaterialTopTabNavigator, MaterialTopTabBarProps } from "@react-navigation/material-top-tabs";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { DISABLED_COLOR, PRIMARY_COLOR, SECONDARY_COLOR } from "../../../config/colors.config";
import {
	CENTER,
	FLEX_ONE,
	FLEX_ROW,
	SMALL_FONT_SIZE,
	SPACE_EVENLY,
	TOP_TAB_HEIGHT
} from "../../../config/constants.config";
import TransactionRouter from "../transaction/TransactionRouter";
import CategoryRouter from "../category/CategoryRouter";
import InvestmentRouter from "../investment/InvestmentRouter";
import SourceRouter from "../source/SourceRouter";
import TripRouter from "../trip/TripRouter";
import CustomText from "../../../components/CustomText";

const FinanceRouter = () => {
	const Tab = createMaterialTopTabNavigator();
	return (
		<View style={styles.view}>
			<Tab.Navigator
				tabBar={(props) => <FinanceTabBar {...props} />}
				screenOptions={{ tabBarScrollEnabled: true }}
			>
				{Object.entries(FinanceRoutes).map(([name, { page }]) => (
					<Tab.Screen name={name} component={page} key={name} />
				))}
			</Tab.Navigator>
		</View>
	);
};

const FinanceRoutes = {
	Transactions: { page: TransactionRouter },
	Categories: { page: CategoryRouter },
	Investments: { page: InvestmentRouter },
	Sources: { page: SourceRouter },
	Trips: { page: TripRouter }
};

const FinanceTabBar = ({ state, navigation }: MaterialTopTabBarProps) => {
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
	view: {
		flex: FLEX_ONE,
		backgroundColor: SECONDARY_COLOR
	},
	container: {
		flexDirection: FLEX_ROW,
		justifyContent: SPACE_EVENLY,
		backgroundColor: SECONDARY_COLOR,
		height: TOP_TAB_HEIGHT,
		alignItems: CENTER
	}
});

export default FinanceRouter;
