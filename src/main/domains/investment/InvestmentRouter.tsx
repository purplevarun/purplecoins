import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { investmentRoutes } from "../../../../Routes";
import ScreenLayout from "../../../../ScreenLayout";
import { SCREEN_OPTIONS } from "../../../../constants.config";
import InvestmentAdd from "./InvestmentAdd";
import InvestmentDetail from "./InvestmentDetail";
import InvestmentEdit from "./InvestmentEdit";
import InvestmentMain from "./InvestmentMain";

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
				<Stack.Screen
					name={investmentRoutes.edit}
					component={InvestmentEdit}
				/>
			</Stack.Navigator>
		</ScreenLayout>
	);
};

export default InvestmentRouter;
