import { createNativeStackNavigator } from "@react-navigation/native-stack";
import RelationAddScreen from "./RelationAddScreen";
import RelationDetailScreen from "./RelationDetailScreen";
import RelationEditScreen from "./RelationEditScreen";
import RelationMainScreen from "./RelationMainScreen";
import RelationMap from "./RelationMap";
import RelationType from "./RelationType";
import ScreenLayout from "./ScreenLayout";
import { SCREEN_OPTIONS } from "./constants.config";

const RelationRouter = ({ route }: any) => {
	const Stack = createNativeStackNavigator();
	const relation = route.params.relation as RelationType;
	const routes = RelationMap[relation].routes;
	return (
		<ScreenLayout>
			<Stack.Navigator screenOptions={SCREEN_OPTIONS}>
				<Stack.Screen
					name={routes.main}
					component={RelationMainScreen}
					initialParams={{ relation }}
				/>
				<Stack.Screen
					name={routes.add}
					component={RelationAddScreen}
					initialParams={{ relation }}
				/>
				<Stack.Screen
					name={routes.detail}
					component={RelationDetailScreen}
					initialParams={{ relation }}
				/>
				<Stack.Screen
					name={routes.edit}
					component={RelationEditScreen}
					initialParams={{ relation }}
				/>
			</Stack.Navigator>
		</ScreenLayout>
	);
};

export default RelationRouter;
