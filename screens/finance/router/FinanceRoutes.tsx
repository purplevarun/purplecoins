import TransactionRouter from "../transaction/TransactionRouter";
import CategoryRouter from "../category/CategoryRouter";
import TripMain from "../trip/TripMain";
import SourceRouter from "../source/SourceRouter";
import InvestmentScreen from "../investment/InvestmentScreen";

const FinanceRoutes = {
	Transactions: { page: TransactionRouter },
	Categories: { page: CategoryRouter },
	Investments: { page: InvestmentScreen },
	Sources: { page: SourceRouter },
	Trips: { page: TripMain },
};

export default FinanceRoutes;
