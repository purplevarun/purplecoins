import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ScreenLayout from "./ScreenLayout";
import TransactionAdd from "./TransactionAdd";
import TransactionDetail from "./TransactionDetail";
import TransactionMain from "./TransactionMain";

const TransactionStack = () => {
	const Stack = createNativeStackNavigator();
	return (
		<ScreenLayout>
			<Stack.Navigator screenOptions={{ headerShown: false }}>
				<Stack.Screen
					name={"Transaction.Main"}
					component={TransactionMain}
				/>
				<Stack.Screen
					name={"Transaction.Add"}
					component={TransactionAdd}
				/>
				<Stack.Screen
					name={"Transaction.Detail"}
					component={TransactionDetail}
				/>
			</Stack.Navigator>
		</ScreenLayout>
	);
};

export default TransactionStack;
