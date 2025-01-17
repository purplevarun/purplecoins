import { FlatList } from "react-native";
import Header from "../../components/Header";
import NoContent from "../../components/NoContent";
import ScreenLayout from "../../components/ScreenLayout";
import useFocus from "../../hooks/useFocus";
import InvestmentAnalysis from "./InvestementAnalysis";
import InvestmentRenderItem from "./InvestmentRenderItem";
import useInvestment from "./useInvestment";

const InvestmentMain = () => {
	const { investments, handleMainFocus, handlePlus } = useInvestment();
	useFocus(handleMainFocus);

	if (investments.length === 0) return <NoContent handlePlus={handlePlus} />;

	return (
		<ScreenLayout>
			<Header handlePlus={handlePlus} />
			<InvestmentAnalysis investments={investments} />
			<FlatList
				data={investments}
				renderItem={({ item }) => <InvestmentRenderItem item={item} />}
			/>
		</ScreenLayout>
	);
};

export default InvestmentMain;
