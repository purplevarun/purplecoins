import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { sourceRoutes } from "../Routes";
import ScreenLayout from "../ScreenLayout";
import { SCREEN_OPTIONS } from "../constants.config";
import SourceAdd from "./SourceAdd";
import SourceDetail from "./SourceDetail";
import SourceEdit from "./SourceEdit";
import SourceMain from "./SourceMain";

const SourceRouter = () => {
	const Stack = createNativeStackNavigator();
	return (
		<ScreenLayout>
			<Stack.Navigator screenOptions={SCREEN_OPTIONS}>
				<Stack.Screen name={sourceRoutes.main} component={SourceMain} />
				<Stack.Screen name={sourceRoutes.add} component={SourceAdd} />
				<Stack.Screen
					name={sourceRoutes.detail}
					component={SourceDetail}
				/>
				<Stack.Screen name={sourceRoutes.edit} component={SourceEdit} />
			</Stack.Navigator>
		</ScreenLayout>
	);
};

export default SourceRouter;
