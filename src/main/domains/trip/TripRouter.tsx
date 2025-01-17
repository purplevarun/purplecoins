import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { tripRoutes } from "../../app/router/Routes";
import ScreenLayout from "../../components/ScreenLayout";
import { SCREEN_OPTIONS } from "../../constants/constants.config";
import TripAdd from "./TripAdd";
import TripDetail from "./TripDetail";
import TripEdit from "./TripEdit";
import TripMain from "./TripMain";

const TripRouter = () => {
	const Stack = createNativeStackNavigator();
	return (
		<ScreenLayout>
			<Stack.Navigator screenOptions={SCREEN_OPTIONS}>
				<Stack.Screen name={tripRoutes.main} component={TripMain} />
				<Stack.Screen name={tripRoutes.add} component={TripAdd} />
				<Stack.Screen name={tripRoutes.detail} component={TripDetail} />
				<Stack.Screen name={tripRoutes.edit} component={TripEdit} />
			</Stack.Navigator>
		</ScreenLayout>
	);
};

export default TripRouter;
