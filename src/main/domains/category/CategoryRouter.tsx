import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AddRelationScreen from "../../AddRelationScreen";
import EditRelationScreen from "../../EditRelationScreen";
import { categoryRoutes } from "../../app/router/Routes";
import ScreenLayout from "../../components/ScreenLayout";
import { SCREEN_OPTIONS } from "../../constants/constants.config";
import RelationType from "../../constants/enums/RelationType";
import CategoryDetail from "./CategoryDetail";
import CategoryMain from "./CategoryMain";

const CategoryRouter = () => {
	const Stack = createNativeStackNavigator();
	const relation = RelationType.CATEGORY;
	return (
		<ScreenLayout>
			<Stack.Navigator screenOptions={SCREEN_OPTIONS}>
				<Stack.Screen
					name={categoryRoutes.main}
					component={CategoryMain}
				/>
				<Stack.Screen
					name={categoryRoutes.add}
					component={AddRelationScreen}
					initialParams={{ relation }}
				/>
				<Stack.Screen
					name={categoryRoutes.detail}
					component={CategoryDetail}
				/>
				<Stack.Screen
					name={categoryRoutes.edit}
					component={EditRelationScreen}
					initialParams={{ relation }}
				/>
			</Stack.Navigator>
		</ScreenLayout>
	);
};

export default CategoryRouter;
