import {
	CategoryIcon,
	InvestmentIcon,
	SettingsIcon,
	SourceIcon,
	TransactionIcon,
	TripIcon,
} from "./Icons";
import SettingScreen from "./SettingScreen";
import TransactionRouter from "./TransactionRouter";
import CategoryRouter from "./src/main/domains/category/CategoryRouter";
import InvestmentRouter from "./src/main/domains/investment/InvestmentRouter";
import SourceRouter from "./src/main/domains/source/SourceRouter";
import TripRouter from "./src/main/domains/trip/TripRouter";

const tabRoutes = {
	source: {
		component: SourceRouter,
		Icon: SourceIcon,
	},
	category: {
		component: CategoryRouter,
		Icon: CategoryIcon,
	},
	trip: {
		component: TripRouter,
		Icon: TripIcon,
	},
	investment: {
		component: InvestmentRouter,
		Icon: InvestmentIcon,
	},
	transaction: {
		component: TransactionRouter,
		Icon: TransactionIcon,
	},
	settings: {
		component: SettingScreen,
		Icon: SettingsIcon,
	},
};

export default tabRoutes;
