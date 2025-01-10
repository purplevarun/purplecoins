import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { categoryRoutes } from "../../../Routes";
import ScreenLayout from "../../../ScreenLayout";
import { SCREEN_OPTIONS } from "../../../constants.config";
import CategoryAdd from "./CategoryAdd";
import CategoryDetail from "./CategoryDetail";
import CategoryEdit from "./CategoryEdit";
import CategoryMain from "./CategoryMain";

const CategoryRouter = () => {
	const Stack = createNativeStackNavigator();
	return (
		<ScreenLayout>
			<Stack.Navigator screenOptions={SCREEN_OPTIONS}>
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
				<Stack.Screen
					name={categoryRoutes.edit}
					component={CategoryEdit}
				/>
			</Stack.Navigator>
		</ScreenLayout>
	);
};

export default CategoryRouter;
