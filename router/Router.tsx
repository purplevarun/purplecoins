import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import BottomTabRoutes from "../config/BottomTabRoutes";
import BottomTabBar from "../config/BottomTabBar";
import "./../config/Constants";

const AppRouter = () => {
	const Tab = createBottomTabNavigator();
	return (
		<Tab.Navigator
			screenOptions={{ headerShown: false }}
			tabBar={BottomTabBar}
		>
			{Object.entries(BottomTabRoutes).map(([name, { page }]) => (
				<Tab.Screen name={name} component={page} key={name} />
			))}
		</Tab.Navigator>
	);
};

export default AppRouter;
