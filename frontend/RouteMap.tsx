import Routes from "./Routes";
import TransactionMain from "./screens/transaction/TransactionMain";
import TransactionAdd from "./screens/transaction/TransactionAdd";
import TransactionDetail from "./screens/transaction/TransactionDetail";
import CategoryMain from "./screens/category/CategoryMain";
import CategoryAdd from "./screens/category/CategoryAdd";
import CategoryDetail from "./screens/category/CategoryDetail";
import TripMain from "./screens/trip/TripMain";
import TripAdd from "./screens/trip/TripAdd";
import TripDetail from "./screens/trip/TripDetail";
import SourceMain from "./screens/source/SourceMain";
import SourceAdd from "./screens/source/SourceAdd";
import SourceDetail from "./screens/source/SourceDetail";
import InvestmentMain from "./screens/investment/InvestmentMain";
import InvestmentAdd from "./screens/investment/InvestmentAdd";
import AnalysisMain from "./screens/analysis/AnalysisMain";
import SyncScreen from "./SyncScreen";

const RouteMap = {
	[Routes.Transaction.Main]: TransactionMain,
	[Routes.Transaction.Add]: TransactionAdd,
	[Routes.Transaction.Detail]: TransactionDetail,
	[Routes.Category.Main]: CategoryMain,
	[Routes.Category.Add]: CategoryAdd,
	[Routes.Category.Detail]: CategoryDetail,
	[Routes.Trip.Main]: TripMain,
	[Routes.Trip.Add]: TripAdd,
	[Routes.Trip.Detail]: TripDetail,
	[Routes.Source.Main]: SourceMain,
	[Routes.Source.Add]: SourceAdd,
	[Routes.Source.Detail]: SourceDetail,
	[Routes.Investment.Main]: InvestmentMain,
	[Routes.Investment.Add]: InvestmentAdd,
	[Routes.Investment.Detail]: InvestmentMain,
	[Routes.Analysis]: AnalysisMain,
	[Routes.Sync]: SyncScreen,
};

export default RouteMap;
