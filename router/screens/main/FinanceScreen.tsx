import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { View } from "react-native";
import { secondaryColor } from "../../../config/Colors";
import { flex } from "../../../config/Constants";
import TopTabBar from "../../../components/TopTabBar";
import RecordScreen from "../finance/RecordScreen";
import AnalysisScreen from "../finance/AnalysisScreen";
import CategoryScreen from "../finance/CategoryScreen";
import TripScreen from "../finance/TripScreen";

const FinanceScreen = () => {
	const Tab = createMaterialTopTabNavigator();
	return (
		<View style={{ flex, backgroundColor: secondaryColor }}>
			<Tab.Navigator
				tabBarPosition="top"
				tabBar={(props) => <TopTabBar {...props} />}
			>
				<Tab.Screen name="Records" component={RecordScreen} />
				<Tab.Screen name="Analysis" component={AnalysisScreen} />
				<Tab.Screen name="Categories" component={CategoryScreen} />
				<Tab.Screen name="Trips" component={TripScreen} />
			</Tab.Navigator>
		</View>
	);
};
export default FinanceScreen;
