import CategoryButton from "../../components/buttons/tab_bar/CategoryButton";
import InvestmentButton from "../../components/buttons/tab_bar/InvestmentButton";
import SettingsButton from "../../components/buttons/tab_bar/SettingsButton";
import SourceButton from "../../components/buttons/tab_bar/SourceButton";
import TransactionButton from "../../components/buttons/tab_bar/TransactionButton";
import TripButton from "../../components/buttons/tab_bar/TripButton";
import Service from "../../constants/enums/Service";
import CategoryRouter from "../../domains/category/CategoryRouter";
import InvestmentRouter from "../../domains/investment/InvestmentRouter";
import SettingScreen from "../../domains/setting/SettingScreen";
import SourceRouter from "../../domains/source/SourceRouter";
import TransactionRouter from "../../domains/transaction/TransactionRouter";
import TripRouter from "../../domains/trip/TripRouter";

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
