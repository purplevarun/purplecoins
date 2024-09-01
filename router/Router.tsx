import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { View, StyleSheet } from "react-native";
import {
	backgroundColor,
	primaryColor,
	secondaryColor,
} from "../config/Colors";
import { useNavigation } from "@react-navigation/native";
import NoteScreen from "./screens/NoteScreen";
import PasswordScreen from "./screens/PasswordScreen";
import MyTabBar from "../components/MyTabBar";
import RecordScreen from "./screens/finance/RecordScreen";
import CategoryScreen from "./screens/finance/CategoryScreen";
import TripScreen from "./screens/finance/TripScreen";
import AnalysisScreen from "./screens/finance/AnalysisScreen";
import MyButton from "../components/MyButton";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MyText from "../components/MyText";

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

const drawer = {
	Finance: FinanceRouter,
	Passwords: PasswordScreen,
	Notes: NoteScreen,
};

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
			{Object.entries(drawer).map(([name, page]) => (
				<Drawer.Screen name={name} component={page} key={name} />
			))}
		</Drawer.Navigator>
	);
};

const Menu = () => {
	const { navigate } = useNavigation();
	return (
		<View
			style={{
				flex: 1,
				backgroundColor: secondaryColor,
				gap: 10,
				alignItems: "center",
			}}
		>
			<View
				style={{
					width: 200,
					backgroundColor: backgroundColor,
					alignItems: "center",
					borderRadius: 10,
					gap: 10,
					paddingVertical: 20,
				}}
			>
				<FontAwesome6
					name="user-large"
					size={100}
					color={primaryColor}
				/>
				<MyText text="Varun Kedia" />
			</View>
			{Object.keys(drawer).map((name) => (
				<MyButton
					key={name}
					text={name}
					onPress={() => navigate(name as never)}
					width={200}
				/>
			))}
		</View>
	);
};

export default AppRouter;
