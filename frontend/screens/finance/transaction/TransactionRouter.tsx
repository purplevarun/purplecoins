import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SCREEN_OPTIONS } from "../../../config/constants.config";
import TransactionAdd from "./TransactionAdd";
import TransactionMain from "./TransactionMain";
import TransactionRoutes from "./TransactionRoutes";
import TransactionDetail from "./TransactionDetail";

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
			<Stack.Screen
				name={TransactionRoutes.Detail}
				component={TransactionDetail}
			/>
		</Stack.Navigator>
	);
};

export default TransactionRouter;
