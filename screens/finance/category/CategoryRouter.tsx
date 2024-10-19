import { createNativeStackNavigator } from "@react-navigation/native-stack";
import CategoryMain from "./CategoryMain";
import CategoryAdd from "./CategoryAdd";

const CategoryRouter = () => {
	const Stack = createNativeStackNavigator();
	return (
		<Stack.Navigator
			screenOptions={{
				headerShown: false,
				animation: "ios",
			}}
		>
			<Stack.Screen name={"Category.Main"} component={CategoryMain} />
			<Stack.Screen name={"Category.Add"} component={CategoryAdd} />
		</Stack.Navigator>
	);
};

export default CategoryRouter;
