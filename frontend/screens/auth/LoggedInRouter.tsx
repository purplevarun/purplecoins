import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SCREEN_OPTIONS } from "../../config/constants.config";
import UserScreen from "./UserScreen";
import LoggedInRoutes from "./LoggedInRoutes";
import LoggedInScreen from "./LoggedInScreen";

const LoggedInRouter = () => {
	const Stack = createNativeStackNavigator();
	return (
		<Stack.Navigator screenOptions={SCREEN_OPTIONS}>
			<Stack.Screen
				name={LoggedInRoutes.Main}
				component={LoggedInScreen}
			/>
			<Stack.Screen name={LoggedInRoutes.User} component={UserScreen} />
		</Stack.Navigator>
	);
};

export default LoggedInRouter;
