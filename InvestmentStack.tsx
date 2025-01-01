import { createNativeStackNavigator } from "@react-navigation/native-stack";
import InvestmentAdd from "./InvestmentAdd";
import InvestmentMain from "./InvestmentMain";
import ScreenLayout from "./ScreenLayout";

const InvestmentStack = () => {
	const Stack = createNativeStackNavigator();
	return (
		<ScreenLayout>
			<Stack.Navigator screenOptions={{ headerShown: false }}>
				<Stack.Screen
					name={"Investment.Main"}
					component={InvestmentMain}
				/>
				<Stack.Screen
					name={"Investment.Add"}
					component={InvestmentAdd}
				/>
				<Stack.Screen
					name={"Investment.Detail"}
					component={InvestmentMain}
				/>
			</Stack.Navigator>
		</ScreenLayout>
	);
};

export default InvestmentStack;
