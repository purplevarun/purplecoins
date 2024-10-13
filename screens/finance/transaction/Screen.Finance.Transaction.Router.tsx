import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ScreenFinanceTransactionAdd from "./Screen.Finance.Transaction.Add";
import ScreenFinanceTransactionMain from "./Screen.Finance.Transaction.Main";

const ScreenFinanceTransactionRouter = () => {
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
				component={ScreenFinanceTransactionMain}
			/>
			<Stack.Screen
				name={"Transaction.Add"}
				component={ScreenFinanceTransactionAdd}
			/>
		</Stack.Navigator>
	);
};
export default ScreenFinanceTransactionRouter;
