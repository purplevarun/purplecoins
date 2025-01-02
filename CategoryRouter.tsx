import { createNativeStackNavigator } from "@react-navigation/native-stack";
import CategoryAdd from "./CategoryAdd";
import CategoryDetail from "./CategoryDetail";
import CategoryMain from "./CategoryMain";
import { categoryRoutes } from "./Routes";
import ScreenLayout from "./ScreenLayout";
import { screenOptions } from "./constants.config";

const CategoryRouter = () => {
	const Stack = createNativeStackNavigator();
	return (
		<ScreenLayout>
			<Stack.Navigator screenOptions={screenOptions}>
				<Stack.Screen
					name={categoryRoutes.main}
					component={CategoryMain}
				/>
				<Stack.Screen
					name={categoryRoutes.add}
					component={CategoryAdd}
				/>
				<Stack.Screen
					name={categoryRoutes.detail}
					component={CategoryDetail}
				/>
			</Stack.Navigator>
		</ScreenLayout>
	);
};

export default CategoryRouter;
