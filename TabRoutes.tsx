import SettingScreen from "./SettingScreen";
import TransactionRouter from "./TransactionRouter";
import CategoryButton from "./src/main/components/buttons/tab_bar/CategoryButton";
import InvestmentButton from "./src/main/components/buttons/tab_bar/InvestmentButton";
import SettingsButton from "./src/main/components/buttons/tab_bar/SettingsButton";
import SourceButton from "./src/main/components/buttons/tab_bar/SourceButton";
import TransactionButton from "./src/main/components/buttons/tab_bar/TransactionButton";
import TripButton from "./src/main/components/buttons/tab_bar/TripButton";
import Service from "./src/main/constants/enums/Service";
import CategoryRouter from "./src/main/domains/category/CategoryRouter";
import InvestmentRouter from "./src/main/domains/investment/InvestmentRouter";
import SourceRouter from "./src/main/domains/source/SourceRouter";
import TripRouter from "./src/main/domains/trip/TripRouter";

const tabRoutes = {
	transaction: {
		name: Service.TRANSACTION,
		component: TransactionRouter,
		Icon: TransactionButton,
	},
	source: {
		name: Service.SOURCE,
		component: SourceRouter,
		Icon: SourceButton,
	},
	category: {
		name: Service.CATEGORY,
		component: CategoryRouter,
		Icon: CategoryButton,
	},
	trip: {
		name: Service.TRIP,
		component: TripRouter,
		Icon: TripButton,
	},
	investment: {
		name: Service.INVESTMENT,
		component: InvestmentRouter,
		Icon: InvestmentButton,
	},
	settings: {
		name: Service.SETTINGS,
		component: SettingScreen,
		Icon: SettingsButton,
	},
};

export default tabRoutes;
