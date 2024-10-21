import { SCREEN_OPTIONS } from "../../../config/constants.config";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TransactionAdd from "./TransactionAdd";
import TransactionMain from "./TransactionMain";
import TransactionRoutes from "./TransactionRoutes";

const TransactionRouter = () => {
	const Stack = createNativeStackNavigator();
	return (
		<Stack.Navigator screenOptions={SCREEN_OPTIONS}>
			<Stack.Screen
				name={TransactionRoutes.Main}
				component={TransactionMain}
			/>
			<Stack.Screen
				name={TransactionRoutes.Add}
				component={TransactionAdd}
			/>
		</Stack.Navigator>
	);
};

export default TransactionRouter;
