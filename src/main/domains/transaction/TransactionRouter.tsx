import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { transactionRoutes } from "../../app/router/Routes";
import ScreenLayout from "../../components/ScreenLayout";
import { SCREEN_OPTIONS } from "../../constants/constants.config";
import TransactionAdd from "./TransactionAdd";
import TransactionDetail from "./TransactionDetail";
import TransactionEdit from "./TransactionEdit";
import TransactionMain from "./TransactionMain";

const TransactionRouter = () => {
	const Stack = createNativeStackNavigator();
	return (
		<ScreenLayout>
			<Stack.Navigator screenOptions={SCREEN_OPTIONS}>
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
				<Stack.Screen
					name={transactionRoutes.edit}
					component={TransactionEdit}
				/>
			</Stack.Navigator>
		</ScreenLayout>
	);
};

export default TransactionRouter;
