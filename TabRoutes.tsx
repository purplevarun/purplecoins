import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import CategoryRouter from "./CategoryRouter";
import InvestmentRouter from "./InvestmentRouter";
import SettingScreen from "./SettingScreen";
import SourceRouter from "./SourceRouter";
import TransactionRouter from "./TransactionRouter";
import TripRouter from "./TripRouter";

const tabRoutes = {
	transaction: {
		component: TransactionRouter,
		icon: { name: "money-bill-transfer", base: FontAwesome6 },
	},
	source: {
		component: SourceRouter,
		icon: { name: "bank", base: FontAwesome },
	},
	category: {
		component: CategoryRouter,
		icon: { name: "list", base: FontAwesome6 },
	},
	trip: {
		component: TripRouter,
		icon: { name: "plane-up", base: FontAwesome6 },
	},
	investment: {
		component: InvestmentRouter,
		icon: { name: "chart-line", base: FontAwesome6 },
	},
	settings: {
		component: SettingScreen,
		icon: { name: "gear", base: FontAwesome6 },
	},
};

export default tabRoutes;
