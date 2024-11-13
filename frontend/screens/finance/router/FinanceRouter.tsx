import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { StyleSheet, View } from "react-native";
import { SECONDARY_COLOR } from "../../../config/colors.config";
import { FLEX_ONE } from "../../../config/constants.config";
import FinanceTabBar from "./FinanceTabBar";
import FinanceRoutes from "./FinanceRoutes";

const FinanceRouter = () => {
	const Tab = createMaterialTopTabNavigator();
	return (
		<View style={styles.view}>
			<Tab.Navigator tabBar={(props) => <FinanceTabBar {...props} />}>
				{Object.entries(FinanceRoutes).map(([name, { page }]) => (
					<Tab.Screen name={name} component={page} key={name} />
				))}
			</Tab.Navigator>
		</View>
	);
};

const styles = StyleSheet.create({
	view: { flex: FLEX_ONE, backgroundColor: SECONDARY_COLOR },
});

export default FinanceRouter;
