import * as NavigationBar from "expo-navigation-bar";
import { useEffect, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "react-native";
import { SCREEN_OPTIONS } from "../../config/constants.config";
import { BACKGROUND_COLOR } from "../../config/colors.config";
import LoggedOutRoutes from "./LoggedOutRoutes";
import CheckUsernameScreen from "./CheckUsernameScreen";
import SignUpScreen from "./SignUpScreen";
import SignInScreen from "./SignInScreen";
import LoadingScreen from "../other/LoadingScreen";
import FlexView from "../../components/FlexView";

const LoggedOutRouter = () => {
	const Stack = createNativeStackNavigator();
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		NavigationBar.setBackgroundColorAsync(BACKGROUND_COLOR)
			.then()
			.catch()
			.finally(() => setLoading(false));
	}, []);

	if (loading) return <LoadingScreen />;
	return (
		<FlexView>
			<StatusBar backgroundColor={BACKGROUND_COLOR} />
			<Stack.Navigator screenOptions={SCREEN_OPTIONS}>
				<Stack.Screen
					name={LoggedOutRoutes.CheckUsername}
					component={CheckUsernameScreen}
				/>
				<Stack.Screen
					name={LoggedOutRoutes.SignUpScreen}
					component={SignUpScreen}
				/>
				<Stack.Screen
					name={LoggedOutRoutes.SignInScreen}
					component={SignInScreen}
				/>
			</Stack.Navigator>
		</FlexView>
	);
};

export default LoggedOutRouter;
