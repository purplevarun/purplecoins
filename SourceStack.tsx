import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ScreenLayout from "./ScreenLayout";
import SourceAdd from "./SourceAdd";
import SourceDetail from "./SourceDetail";
import SourceMain from "./SourceMain";

const SourceStack = () => {
	const Stack = createNativeStackNavigator();
	return (
		<ScreenLayout>
			<Stack.Navigator
				screenOptions={{
					headerShown: false,
				}}
			>
				<Stack.Screen name={"Source.Main"} component={SourceMain} />
				<Stack.Screen name={"Source.Add"} component={SourceAdd} />
				<Stack.Screen name={"Source.Detail"} component={SourceDetail} />
			</Stack.Navigator>
		</ScreenLayout>
	);
};

export default SourceStack;
