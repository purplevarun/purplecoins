import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ScreenLayout from "./ScreenLayout";
import TripAdd from "./TripAdd";
import TripDetail from "./TripDetail";
import TripMain from "./TripMain";

const TripStack = () => {
	const Stack = createNativeStackNavigator();
	return (
		<ScreenLayout>
			<Stack.Navigator screenOptions={{ headerShown: false }}>
				<Stack.Screen name={"Trip.Main"} component={TripMain} />
				<Stack.Screen name={"Trip.Add"} component={TripAdd} />
				<Stack.Screen name={"Trip.Detail"} component={TripDetail} />
			</Stack.Navigator>
		</ScreenLayout>
	);
};

export default TripStack;
