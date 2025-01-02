import { useNavigation } from "@react-navigation/native";

const useNavigate = () => {
	const { navigate } = useNavigation<any>();

	const navigateToTransactionMain = () => navigate("Transaction.Main");
	const navigateToTransactionAdd = () => navigate("Transaction.Add");
	const navigateToTransactionDetail = (transactionId: string) =>
		navigate("Transaction.Detail", { transactionId });
	const navigateToTransactionEdit = (transactionId: string) =>
		navigate("Transaction.Edit", { transactionId });
	const navigateToSourceMain = () => navigate("Source.Main");
	const navigateToSourceAdd = () => navigate("Source.Add");
	const navigateToSourceDetail = (sourceId: string) =>
		navigate("Source.Detail", { sourceId });
	const navigateToSourceEdit = (sourceId: string) =>
		navigate("Source.Edit", { sourceId });
	const navigateToInvestmentMain = () => navigate("Investment.Main");
	const navigateToInvestmentAdd = () => navigate("Investment.Add");
	const navigateToInvestmentDetail = (investmentId: string) =>
		navigate("Investment.Detail", { investmentId });
	const navigateToInvestmentEdit = (investmentId: string) =>
		navigate("Investment.Edit", { investmentId });
	const navigateToTripMain = () => navigate("Trip.Main");
	const navigateToTripAdd = () => navigate("Trip.Add");
	const navigateToTripDetail = (tripId: string) =>
		navigate("Trip.Detail", { tripId });
	const navigateToTripEdit = (tripId: string) =>
		navigate("Trip.Edit", { tripId });
	const navigateToCategoryMain = () => navigate("Category.Main");
	const navigateToCategoryAdd = () => navigate("Category.Add");
	const navigateToCategoryDetail = (categoryId: string) =>
		navigate("Category.Detail", { categoryId });
	const navigateToCategoryEdit = (categoryId: string) =>
		navigate("Category.Edit", { categoryId });

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
