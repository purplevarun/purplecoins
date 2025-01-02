import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { transactionRoutes } from "./Routes";
import ScreenLayout from "./ScreenLayout";
import TransactionAdd from "./TransactionAdd";
import TransactionDetail from "./TransactionDetail";
import TransactionMain from "./TransactionMain";
import { screenOptions } from "./constants.config";

const TransactionRouter = () => {
	const Stack = createNativeStackNavigator();
	return (
		<ScreenLayout>
			<Stack.Navigator screenOptions={screenOptions}>
				<Stack.Screen
					name={transactionRoutes.main}
					component={TransactionMain}
				/>
				<Stack.Screen
					name={transactionRoutes.add}
					component={TransactionAdd}
				/>
				<Stack.Screen
					name={transactionRoutes.detail}
					component={TransactionDetail}
				/>
			</Stack.Navigator>
		</ScreenLayout>
	);
};

export default TransactionRouter;
