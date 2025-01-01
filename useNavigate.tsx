import { useNavigation } from "@react-navigation/native";

const useNavigate = () => {
	const { navigate } = useNavigation<any>();

	const navigateToTransactionMain = () => navigate("Transaction.Main");
	const navigateToTransactionAdd = () => navigate("Transaction.Add");
	const navigateToTransactionDetail = () => navigate("Transaction.Detail");
	const navigateToTransactionEdit = () => navigate("Transaction.Edit");
	const navigateToSourceMain = () => navigate("Source.Main");
	const navigateToSourceAdd = () => navigate("Source.Add");
	const navigateToSourceDetail = () => navigate("Source.Detail");
	const navigateToSourceEdit = () => navigate("Source.Edit");
	const navigateToInvestmentMain = () => navigate("Investment.Main");
	const navigateToInvestmentAdd = () => navigate("Investment.Add");
	const navigateToInvestmentDetail = () => navigate("Investment.Detail");
	const navigateToInvestmentEdit = () => navigate("Investment.Edit");
	const navigateToTripMain = () => navigate("Trip.Main");
	const navigateToTripAdd = () => navigate("Trip.Add");
	const navigateToTripDetail = () => navigate("Trip.Detail");
	const navigateToTripEdit = () => navigate("Trip.Edit");
	const navigateToCategoryMain = () => navigate("Category.Main");
	const navigateToCategoryAdd = () => navigate("Category.Add");
	const navigateToCategoryDetail = () => navigate("Category.Detail");
	const navigateToCategoryEdit = () => navigate("Category.Edit");

	return {
		navigateToTransactionMain,
		navigateToTransactionAdd,
		navigateToTransactionDetail,
		navigateToTransactionEdit,
		navigateToSourceMain,
		navigateToSourceAdd,
		navigateToSourceDetail,
		navigateToSourceEdit,
		navigateToInvestmentMain,
		navigateToInvestmentAdd,
		navigateToInvestmentDetail,
		navigateToInvestmentEdit,
		navigateToTripMain,
		navigateToTripAdd,
		navigateToTripDetail,
		navigateToTripEdit,
		navigateToCategoryMain,
		navigateToCategoryAdd,
		navigateToCategoryDetail,
		navigateToCategoryEdit,
	};
};

export default useNavigate;
