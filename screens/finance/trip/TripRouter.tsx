import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SCREEN_OPTIONS } from "../../../config/constants.config";
import TripMain from "./TripMain";
import TripAdd from "./TripAdd";
import TripRoutes from "./TripRoutes";

const TripRouter = () => {
	const Stack = createNativeStackNavigator();
	return (
		<Stack.Navigator screenOptions={SCREEN_OPTIONS}>
			<Stack.Screen name={TripRoutes.Main} component={TripMain} />
			<Stack.Screen name={TripRoutes.Add} component={TripAdd} />
		</Stack.Navigator>
	);
};
export default TripRouter;
