import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import BottomRoutes from "./BottomRoutes";
import TabBar from "./TabBar";

const Router = () => {
	const TopTab = createMaterialTopTabNavigator();
	return (
		<TopTab.Navigator
			tabBarPosition={"bottom"}
			tabBar={(props) => <TabBar {...props} />}
		>
			{Object.entries(BottomRoutes).map(([name, { component }]) => (
				<TopTab.Screen name={name} component={component} key={name} />
			))}
		</TopTab.Navigator>
	);
};

export default Router;
