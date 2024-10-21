import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import BottomTabBar from "./BottomTabBar";
import BottomRoutes from "./BottomRoutes";

const BottomRouter = () => {
	const Tab = createBottomTabNavigator();
	return (
		<Tab.Navigator
			screenOptions={{ headerShown: false }}
			tabBar={BottomTabBar}
		>
			{Object.entries(BottomRoutes).map(([name, { page }]) => (
				<Tab.Screen name={name} component={page} key={name} />
			))}
		</Tab.Navigator>
	);
};

export default BottomRouter;
