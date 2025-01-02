import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { FC } from "react";
import { View } from "react-native";
import { BACKGROUND_COLOR } from "./colors.config";
import { FLEX_ONE, screenOptions } from "./constants.config";

type IStackNavigator = FC<{
	screens: { name: string; component: FC }[];
}>;
const StackNavigator: IStackNavigator = ({ screens }) => {
	const Stack = createNativeStackNavigator();
	return (
		<View style={{ backgroundColor: BACKGROUND_COLOR, flex: FLEX_ONE }}>
			<Stack.Navigator screenOptions={screenOptions}>
				{screens.map((screen) => (
					<Stack.Screen
						key={screen.name}
						name={screen.name}
						component={screen.component}
					/>
				))}
			</Stack.Navigator>
		</View>
	);
};

export default StackNavigator;
