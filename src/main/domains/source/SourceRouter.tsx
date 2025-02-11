import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AddRelationScreen from "../../AddRelationScreen";
import EditRelationScreen from "../../EditRelationScreen";
import { sourceRoutes } from "../../app/router/Routes";
import ScreenLayout from "../../components/ScreenLayout";
import { SCREEN_OPTIONS } from "../../constants/constants.config";
import RelationType from "../../constants/enums/RelationType";
import SourceDetail from "./SourceDetail";
import SourceMain from "./SourceMain";

const SourceRouter = () => {
	const Stack = createNativeStackNavigator();
	const relation = RelationType.SOURCE;
	return (
		<ScreenLayout>
			<Stack.Navigator screenOptions={SCREEN_OPTIONS}>
				<Stack.Screen name={sourceRoutes.main} component={SourceMain} />
				<Stack.Screen
					name={sourceRoutes.add}
					component={AddRelationScreen}
					initialParams={{ relation }}
				/>
				<Stack.Screen
					name={sourceRoutes.detail}
					component={SourceDetail}
				/>
				<Stack.Screen
					name={sourceRoutes.edit}
					component={EditRelationScreen}
					initialParams={{ relation }}
				/>
			</Stack.Navigator>
		</ScreenLayout>
	);
};

export default SourceRouter;
