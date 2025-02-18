import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { TAB_BAR_POSITION } from "./constants.config";
import TabBar from "./TabBar";
import tabRoutes from "./TabRoutes";

const Router = () => {
	const TopTab = createMaterialTopTabNavigator();
	useEffect(() => {
		SplashScreen.hideAsync().catch();
	}, []);
	return (
		<TopTab.Navigator tabBarPosition={TAB_BAR_POSITION} tabBar={TabBar}>
			{Object.values(tabRoutes).map(({ name, component, params }) => (
				<TopTab.Screen
					name={name}
					component={component}
					key={name}
					initialParams={params}
				/>
			))}
		</TopTab.Navigator>
	);
};

export default Router;
