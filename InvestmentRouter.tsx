import { createNativeStackNavigator } from "@react-navigation/native-stack";
import InvestmentAdd from "./InvestmentAdd";
import InvestmentDetail from "./InvestmentDetail";
import InvestmentMain from "./InvestmentMain";
import { investmentRoutes } from "./Routes";
import ScreenLayout from "./ScreenLayout";
import { SCREEN_OPTIONS } from "./constants.config";

const InvestmentRouter = () => {
	const Stack = createNativeStackNavigator();
	return (
		<ScreenLayout>
			<Stack.Navigator screenOptions={SCREEN_OPTIONS}>
				<Stack.Screen
					name={investmentRoutes.main}
					component={InvestmentMain}
				/>
				<Stack.Screen
					name={investmentRoutes.add}
					component={InvestmentAdd}
				/>
				<Stack.Screen
					name={investmentRoutes.detail}
					component={InvestmentDetail}
				/>
			</Stack.Navigator>
		</ScreenLayout>
	);
};

export default InvestmentRouter;
