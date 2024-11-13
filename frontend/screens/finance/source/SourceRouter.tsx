import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SCREEN_OPTIONS } from "../../../config/constants.config";
import SourceRoutes from "./SourceRoutes";
import SourceMain from "./SourceMain";
import SourceAdd from "./SourceAdd";

const SourceRouter = () => {
	const Stack = createNativeStackNavigator();
	return (
		<Stack.Navigator screenOptions={SCREEN_OPTIONS}>
			<Stack.Screen name={SourceRoutes.Main} component={SourceMain} />
			<Stack.Screen name={SourceRoutes.Add} component={SourceAdd} />
		</Stack.Navigator>
	);
};

export default SourceRouter;
