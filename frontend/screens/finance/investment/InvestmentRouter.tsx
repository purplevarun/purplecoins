import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SCREEN_OPTIONS } from "../../../config/constants.config";
import InvestmentRoutes from "./InvestmentRoutes";
import InvestmentMain from "./InvestmentMain";
import InvestmentAdd from "./InvestmentAdd";

const InvestmentRouter = () => {
	const Stack = createNativeStackNavigator();
	return (
		<Stack.Navigator screenOptions={SCREEN_OPTIONS}>
			<Stack.Screen
				name={InvestmentRoutes.Main}
				component={InvestmentMain}
			/>
			<Stack.Screen
				name={InvestmentRoutes.Add}
				component={InvestmentAdd}
			/>
		</Stack.Navigator>
	);
};

export default InvestmentRouter;
