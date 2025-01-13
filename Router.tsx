import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import TabBar from "./TabBar";
import tabRoutes from "./TabRoutes";
import { TAB_BAR_POSITION } from "./constants.config";

const Router = () => {
	const TopTab = createMaterialTopTabNavigator();
	return (
		<TopTab.Navigator tabBarPosition={TAB_BAR_POSITION} tabBar={TabBar}>
			{Object.values(tabRoutes).map(({ name, component }) => (
				<TopTab.Screen name={name} component={component} key={name} />
			))}
		</TopTab.Navigator>
	);
};

export default Router;
