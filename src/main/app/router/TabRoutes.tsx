import CategoryButton from "../../components/buttons/tab_bar/CategoryButton";
import InvestmentButton from "../../components/buttons/tab_bar/InvestmentButton";
import SettingsButton from "../../components/buttons/tab_bar/SettingsButton";
import SourceButton from "../../components/buttons/tab_bar/SourceButton";
import TransactionButton from "../../components/buttons/tab_bar/TransactionButton";
import TripButton from "../../components/buttons/tab_bar/TripButton";
import RelationType from "../../constants/enums/RelationType";
import Service from "../../constants/enums/Service";
import RelationRouter from "../../screens/relation/RelationRouter";
import SettingScreen from "../../screens/setting/SettingScreen";
import TransactionRouter from "../../screens/transaction/TransactionRouter";

const tabRoutes = {
	transaction: {
		name: Service.TRANSACTION,
		component: TransactionRouter,
		Icon: TransactionButton,
		params: {},
	},
	source: {
		name: Service.SOURCE,
		component: RelationRouter,
		Icon: SourceButton,
		params: { relation: RelationType.SOURCE },
	},
	category: {
		name: Service.CATEGORY,
		component: RelationRouter,
		Icon: CategoryButton,
		params: { relation: RelationType.CATEGORY },
	},
	trip: {
		name: Service.TRIP,
		component: RelationRouter,
		Icon: TripButton,
		params: { relation: RelationType.TRIP },
	},
	investment: {
		name: Service.INVESTMENT,
		component: RelationRouter,
		Icon: InvestmentButton,
		params: { relation: RelationType.INVESTMENT },
	},
	settings: {
		name: Service.SETTINGS,
		component: SettingScreen,
		Icon: SettingsButton,
		params: {},
	},
};

export default tabRoutes;
