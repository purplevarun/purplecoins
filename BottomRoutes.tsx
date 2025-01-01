import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import CategoryStack from "./CategoryStack";
import InvestmentStack from "./InvestmentStack";
import SourceStack from "./SourceStack";
import SyncScreen from "./SyncScreen";
import TransactionStack from "./TransactionStack";
import TripStack from "./TripStack";

const BottomRoutes = {
	Transaction: {
		component: TransactionStack,
		icon: { name: "money-bill-transfer", base: FontAwesome6 },
	},
	Source: {
		component: SourceStack,
		icon: { name: "bank", base: FontAwesome },
	},
	Category: {
		component: CategoryStack,
		icon: { name: "list", base: FontAwesome6 },
	},
	Trip: {
		component: TripStack,
		icon: { name: "plane-up", base: FontAwesome6 },
	},
	Investment: {
		component: InvestmentStack,
		icon: { name: "chart-line", base: FontAwesome6 },
	},
	Settings: {
		component: SyncScreen,
		icon: { name: "gear", base: FontAwesome6 },
	},
};

export default BottomRoutes;
