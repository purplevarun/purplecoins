import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AddRelationScreen from "../../AddRelationScreen";
import EditRelationScreen from "../../EditRelationScreen";
import { tripRoutes } from "../../app/router/Routes";
import ScreenLayout from "../../components/ScreenLayout";
import { SCREEN_OPTIONS } from "../../constants/constants.config";
import RelationType from "../../constants/enums/RelationType";
import TripDetail from "./TripDetail";
import TripMain from "./TripMain";

const TripRouter = () => {
	const Stack = createNativeStackNavigator();
	const relation = RelationType.TRIP;
	return (
		<ScreenLayout>
			<Stack.Navigator screenOptions={SCREEN_OPTIONS}>
				<Stack.Screen name={tripRoutes.main} component={TripMain} />
				<Stack.Screen
					name={tripRoutes.add}
					component={AddRelationScreen}
					initialParams={{ relation }}
				/>
				<Stack.Screen name={tripRoutes.detail} component={TripDetail} />
				<Stack.Screen
					name={tripRoutes.edit}
					component={EditRelationScreen}
					initialParams={{ relation }}
				/>
			</Stack.Navigator>
		</ScreenLayout>
	);
};

export default TripRouter;
