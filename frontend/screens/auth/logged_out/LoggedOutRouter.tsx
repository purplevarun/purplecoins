import * as NavigationBar from "expo-navigation-bar";
import { useEffect } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar, StyleSheet, View } from "react-native";
import { FLEX_ONE, SCREEN_OPTIONS } from "../../../config/constants.config";
import { BACKGROUND_COLOR, SECONDARY_COLOR } from "../../../config/colors.config";
import LoggedOutRoutes from "./LoggedOutRoutes";
import CheckUsernameScreen from "./CheckUsernameScreen";
import SignUpScreen from "./SignUpScreen";
import SignInScreen from "./SignInScreen";

const LoggedOutRouter = () => {
	const Stack = createNativeStackNavigator();
	useEffect(() => {
		NavigationBar.setBackgroundColorAsync(BACKGROUND_COLOR).catch();
	}, []);

	return (
		<View style={styles.flexView}>
			<StatusBar backgroundColor={BACKGROUND_COLOR} />
			<Stack.Navigator screenOptions={SCREEN_OPTIONS}>
				<Stack.Screen
					name={LoggedOutRoutes.CheckUser}
					component={CheckUsernameScreen}
				/>
				<Stack.Screen
					name={LoggedOutRoutes.SignUp}
					component={SignUpScreen}
				/>
				<Stack.Screen
					name={LoggedOutRoutes.SignIn}
					component={SignInScreen}
				/>
			</Stack.Navigator>
		</View>
	);
};

const styles = StyleSheet.create({
	flexView: {
		flex: FLEX_ONE,
		backgroundColor: SECONDARY_COLOR
	}
});

export default LoggedOutRouter;
