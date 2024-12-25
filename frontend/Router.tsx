import { createDrawerNavigator } from "@react-navigation/drawer";
import Routes from "./Routes";
import TransactionMain from "./screens/transaction/TransactionMain";
import TransactionAdd from "./screens/transaction/TransactionAdd";
import TransactionDetail from "./screens/transaction/TransactionDetail";
import AnalysisMain from "./screens/analysis/AnalysisMain";
import CategoryMain from "./screens/category/CategoryMain";
import CategoryAdd from "./screens/category/CategoryAdd";
import CategoryDetail from "./screens/category/CategoryDetail";
import TripMain from "./screens/trip/TripMain";
import TripAdd from "./screens/trip/TripAdd";
import TripDetail from "./screens/trip/TripDetail";
import SourceMain from "./screens/source/SourceMain";
import SourceAdd from "./screens/source/SourceAdd";
import InvestmentMain from "./screens/investment/InvestmentMain";
import InvestmentAdd from "./screens/investment/InvestmentAdd";
import Menu from "./Menu";
import Header from "./Header";
import SyncScreen from "./SyncScreen";

const Router = () => {
	const Drawer = createDrawerNavigator();
	return (
		<Drawer.Navigator
			screenOptions={{
				header: (props) => <Header {...props} />,
			}}
			drawerContent={(props) => <Menu {...props} />}
		>
			<Drawer.Screen
				name={Routes.Transaction.Main}
				component={TransactionMain}
			/>
			<Drawer.Screen
				name={Routes.Transaction.Add}
				component={TransactionAdd}
			/>
			<Drawer.Screen
				name={Routes.Transaction.Detail}
				component={TransactionDetail}
			/>
			<Drawer.Screen
				name={Routes.Analysis.Main}
				component={AnalysisMain}
			/>
			<Drawer.Screen
				name={Routes.Category.Main}
				component={CategoryMain}
			/>
			<Drawer.Screen name={Routes.Category.Add} component={CategoryAdd} />
			<Drawer.Screen
				name={Routes.Category.Detail}
				component={CategoryDetail}
			/>
			<Drawer.Screen name={Routes.Trip.Main} component={TripMain} />
			<Drawer.Screen name={Routes.Trip.Add} component={TripAdd} />
			<Drawer.Screen name={Routes.Trip.Detail} component={TripDetail} />
			<Drawer.Screen name={Routes.Source.Main} component={SourceMain} />
			<Drawer.Screen name={Routes.Source.Add} component={SourceAdd} />
			<Drawer.Screen
				name={Routes.Investment.Main}
				component={InvestmentMain}
			/>
			<Drawer.Screen
				name={Routes.Investment.Add}
				component={InvestmentAdd}
			/>
			<Drawer.Screen name={Routes.Sync} component={SyncScreen} />
		</Drawer.Navigator>
	);
};

export default Router;
