import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AddRelationScreen from "../../AddRelationScreen";
import EditRelationScreen from "../../EditRelationScreen";
import { investmentRoutes } from "../../app/router/Routes";
import ScreenLayout from "../../components/ScreenLayout";
import { SCREEN_OPTIONS } from "../../constants/constants.config";
import RelationType from "../../constants/enums/RelationType";
import InvestmentDetail from "./InvestmentDetail";
import InvestmentMain from "./InvestmentMain";

const InvestmentRouter = () => {
	const Stack = createNativeStackNavigator();
	const relation = RelationType.INVESTMENT;
	return (
		<ScreenLayout>
			<Stack.Navigator screenOptions={SCREEN_OPTIONS}>
				<Stack.Screen
					name={investmentRoutes.main}
					component={InvestmentMain}
				/>
				<Stack.Screen
					name={investmentRoutes.add}
					component={AddRelationScreen}
					initialParams={{ relation }}
				/>
				<Stack.Screen
					name={investmentRoutes.detail}
					component={InvestmentDetail}
				/>
				<Stack.Screen
					name={investmentRoutes.edit}
					component={EditRelationScreen}
					initialParams={{ relation }}
				/>
			</Stack.Navigator>
		</ScreenLayout>
	);
};

export default InvestmentRouter;
