import { createNativeStackNavigator } from "@react-navigation/native-stack";
import CategoryAdd from "./CategoryAdd";
import CategoryDetail from "./CategoryDetail";
import CategoryMain from "./CategoryMain";
import ScreenLayout from "./ScreenLayout";

const CategoryStack = () => {
	const Stack = createNativeStackNavigator();
	return (
		<ScreenLayout>
			<Stack.Navigator screenOptions={{ headerShown: false }}>
				<Stack.Screen name={"Category.Main"} component={CategoryMain} />
				<Stack.Screen name={"Category.Add"} component={CategoryAdd} />
				<Stack.Screen
					name={"Category.Detail"}
					component={CategoryDetail}
				/>
			</Stack.Navigator>
		</ScreenLayout>
	);
};

export default CategoryStack;
