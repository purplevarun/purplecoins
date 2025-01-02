import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import TabBar from "./TabBar";
import tabRoutes from "./TabRoutes";

const Router = () => {
	const TopTab = createMaterialTopTabNavigator();
	return (
		<TopTab.Navigator
			tabBarPosition={"bottom"}
			tabBar={(props) => <TabBar {...props} />}
		>
			{Object.entries(tabRoutes).map(([name, { component }]) => (
				<TopTab.Screen name={name} component={component} key={name} />
			))}
		</TopTab.Navigator>
	);
};

export default Router;
