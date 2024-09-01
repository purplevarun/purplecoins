import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import NoteScreen from "./screens/NoteScreen";
import PasswordScreen from "./screens/PasswordScreen";
import SettingScreen from "./screens/SettingScreen";
import MyTabBar from "../components/MyTabBar";
const Router = () => {
	const Tab = createMaterialTopTabNavigator();
	return (
		<Tab.Navigator
			tabBarPosition="bottom"
			tabBar={(props) => <MyTabBar {...props} />}
		>
			<Tab.Screen name="Notes" component={NoteScreen} />
			<Tab.Screen name="Passwords" component={PasswordScreen} />
			<Tab.Screen name="Settings" component={SettingScreen} />
		</Tab.Navigator>
	);
};
export default Router;
