import CategoryRouter from "./category/CategoryRouter";
import {
	CategoryIcon,
	InvestmentIcon,
	SettingsIcon,
	SourceIcon,
	TransactionIcon,
	TripIcon,
} from "./Icons";
import InvestmentRouter from "./InvestmentRouter";
import SettingScreen from "./SettingScreen";
import SourceRouter from "./source/SourceRouter";
import TransactionRouter from "./TransactionRouter";
import TripRouter from "./trip/TripRouter";

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
