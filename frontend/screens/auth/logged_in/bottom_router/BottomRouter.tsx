import {
	BottomTabNavigationOptions,
	createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";
import { SCREEN_OPTIONS } from "../../../../config/constants.config";
import BottomTabBar from "./BottomTabBar";
import BottomRoutes from "./BottomRoutes";

const BottomRouter = () => {
	const Tab = createBottomTabNavigator();
	return (
		<Tab.Navigator
			screenOptions={SCREEN_OPTIONS as BottomTabNavigationOptions}
			tabBar={BottomTabBar}
		>
			{Object.entries(BottomRoutes).map(([name, { page }]) => (
				<Tab.Screen name={name} component={page} key={name} />
			))}
		</Tab.Navigator>
	);
};

export default BottomRouter;
