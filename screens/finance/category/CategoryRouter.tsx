import { SCREEN_OPTIONS } from "../../../config/constants.config";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import CategoryMain from "./CategoryMain";
import CategoryAdd from "./CategoryAdd";
import CategoryRoutes from "./CategoryRoutes";

const CategoryRouter = () => {
	const Stack = createNativeStackNavigator();
	return (
		<Stack.Navigator screenOptions={SCREEN_OPTIONS}>
			<Stack.Screen name={CategoryRoutes.Main} component={CategoryMain} />
			<Stack.Screen name={CategoryRoutes.Add} component={CategoryAdd} />
		</Stack.Navigator>
	);
};

export default CategoryRouter;
