import TransactionRouter from "../transaction/TransactionRouter";
import AnalysisScreen from "../analysis/AnalysisScreen";
import CategoryRouter from "../category/CategoryRouter";
import TripMain from "../trip/TripMain";
import SourceScreen from "../source/SourceScreen";

const FinanceRoutes = {
	Transactions: { page: TransactionRouter },
	Analysis: { page: AnalysisScreen },
	Categories: { page: CategoryRouter },
	Sources: { page: SourceScreen },
	Trips: { page: TripMain },
};

export default FinanceRoutes;
