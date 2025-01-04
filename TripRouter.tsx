import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { tripRoutes } from "./Routes";
import ScreenLayout from "./ScreenLayout";
import TripAdd from "./TripAdd";
import TripDetail from "./TripDetail";
import TripMain from "./TripMain";
import { SCREEN_OPTIONS } from "./constants.config";

const TripRouter = () => {
	const Stack = createNativeStackNavigator();
	return (
		<ScreenLayout>
			<Stack.Navigator screenOptions={SCREEN_OPTIONS}>
				<Stack.Screen name={tripRoutes.main} component={TripMain} />
				<Stack.Screen name={tripRoutes.add} component={TripAdd} />
				<Stack.Screen name={tripRoutes.detail} component={TripDetail} />
			</Stack.Navigator>
		</ScreenLayout>
	);
};

export default TripRouter;
