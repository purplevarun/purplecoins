import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SCREEN_OPTIONS } from "../../../config/constants.config";
import CategoryMain from "./CategoryMain";
import CategoryAdd from "./CategoryAdd";
import CategoryRoutes from "./CategoryRoutes";
import CategoryDetail from "./CategoryDetail";

const CategoryRouter = () => {
	const Stack = createNativeStackNavigator();
	return (
		<Stack.Navigator screenOptions={SCREEN_OPTIONS}>
			<Stack.Screen name={CategoryRoutes.Main} component={CategoryMain} />
			<Stack.Screen name={CategoryRoutes.Add} component={CategoryAdd} />
			<Stack.Screen name={CategoryRoutes.Detail} component={CategoryDetail} />
		</Stack.Navigator>
	);
};

export default CategoryRouter;
