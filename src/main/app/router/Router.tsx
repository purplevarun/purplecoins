import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { TAB_BAR_POSITION } from "../../constants/constants.config";
import TabBar from "./TabBar";
import tabRoutes from "./TabRoutes";

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
