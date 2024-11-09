import * as NavigationBar from "expo-navigation-bar";
import { useEffect } from "react";
import { StatusBar } from "react-native";
import { SECONDARY_COLOR } from "../../config/colors.config";
import Header from "../../components/Header";
import BottomRouter from "../../bottom_router/BottomRouter";
import FlexView from "../../components/FlexView";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import UserScreen from "./UserScreen";
import { SCREEN_OPTIONS } from "../../config/constants.config";
import LoggedInRoutes from "./LoggedInRoutes";

const LoggedInRouter = () => {
	const Stack = createNativeStackNavigator();
	return (
		<Stack.Navigator screenOptions={SCREEN_OPTIONS}>
			<Stack.Screen
				name={LoggedInRoutes.Dashboard}
				component={LoggedInScreen}
			/>
			<Stack.Screen name={LoggedInRoutes.User} component={UserScreen} />
		</Stack.Navigator>
	);
};

const LoggedInScreen = () => {
	useEffect(() => {
		NavigationBar.setBackgroundColorAsync(SECONDARY_COLOR).catch();
	}, []);

	return (
		<FlexView>
			<StatusBar backgroundColor={SECONDARY_COLOR} />
			<Header />
			<BottomRouter />
		</FlexView>
	);
};

export default LoggedInRouter;
