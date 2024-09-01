import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { View, Button } from "react-native";
import { secondaryColor } from "../config/Colors";
import NoteScreen from "./screens/NoteScreen";
import PasswordScreen from "./screens/PasswordScreen";
import MyTabBar from "../components/MyTabBar";
import RecordScreen from "./screens/finance/RecordScreen";
import CategoryScreen from "./screens/finance/CategoryScreen";
import TripScreen from "./screens/finance/TripScreen";
import AnalysisScreen from "./screens/finance/AnalysisScreen";

const AppRouter = () => {
	const Drawer = createDrawerNavigator();
	return (
		<Drawer.Navigator
			screenOptions={{
				headerShown: false,
				drawerPosition: "right",
				drawerStyle: { width: "60%" },
			}}
			drawerContent={Menu}
		>
			<Drawer.Screen name="Finance" component={FinanceRouter} />
			<Drawer.Screen name="Passwords" component={PasswordScreen} />
			<Drawer.Screen name="Notes" component={NoteScreen} />
		</Drawer.Navigator>
	);
};

const Menu = () => {
	return (
		<View style={{ flex: 1, backgroundColor: secondaryColor }}>
			<Button title="Finance" />
			<Button title="Passwords" />
			<Button title="Notes" />
		</View>
	);
};

const FinanceRouter = () => {
	const Tab = createMaterialTopTabNavigator();
	return (
		<View style={{ flex: 1, backgroundColor: secondaryColor }}>
			<Tab.Navigator
				tabBarPosition="bottom"
				tabBar={(props) => <MyTabBar {...props} />}
			>
				<Tab.Screen name="Records" component={RecordScreen} />
				<Tab.Screen name="Analysis" component={AnalysisScreen} />
				<Tab.Screen name="Categories" component={CategoryScreen} />
				<Tab.Screen name="Trips" component={TripScreen} />
			</Tab.Navigator>
		</View>
	);
};
export default AppRouter;
