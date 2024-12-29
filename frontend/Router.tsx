import { createDrawerNavigator } from "@react-navigation/drawer";
import Menu from "./Menu";
import Header from "./Header";
import Routes from "./Routes";
import RouteMap from "./RouteMap";

const Router = () => {
	const Drawer = createDrawerNavigator();
	return (
		<Drawer.Navigator
			screenOptions={{
				header: (props) => <Header {...props} />,
			}}
			drawerContent={(props) => <Menu {...props} />}
			initialRouteName={Routes.Transaction.Main}
		>
			{Object.keys(RouteMap).map((routeName) => (
				<Drawer.Screen
					name={routeName}
					component={RouteMap[routeName]}
					key={routeName}
				/>
			))}
		</Drawer.Navigator>
	);
};

export default Router;
