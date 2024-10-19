import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TransactionAdd from "./TransactionAdd";
import TransactionMain from "./TransactionMain";

const TransactionRouter = () => {
	const Stack = createNativeStackNavigator();
	return (
		<Stack.Navigator
			screenOptions={{
				headerShown: false,
				animation: "ios",
			}}
		>
			<Stack.Screen
				name={"Transaction.Main"}
				component={TransactionMain}
			/>
			<Stack.Screen
				name={"Transaction.Add"}
				component={TransactionAdd}
			/>
		</Stack.Navigator>
	);
};

export default TransactionRouter;
