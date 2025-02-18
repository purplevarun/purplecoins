import CategoryButton from "./CategoryButton";
import InvestmentButton from "./InvestmentButton";
import SettingsButton from "./SettingsButton";
import SourceButton from "./SourceButton";
import TransactionButton from "./TransactionButton";
import TripButton from "./TripButton";
import RelationType from "./RelationType";
import Service from "./Service";
import RelationRouter from "./RelationRouter";
import SettingScreen from "./SettingScreen";
import TransactionRouter from "./TransactionRouter";

const tabRoutes = {
	transaction: {
		name: Service.TRANSACTION,
		component: TransactionRouter,
		Icon: TransactionButton,
		params: {},
	},
	category: {
		name: Service.CATEGORY,
		component: RelationRouter,
		Icon: CategoryButton,
		params: { relation: RelationType.CATEGORY },
	},
	source: {
		name: Service.SOURCE,
		component: RelationRouter,
		Icon: SourceButton,
		params: { relation: RelationType.SOURCE },
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
