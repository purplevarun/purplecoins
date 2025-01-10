import { FlatList } from "react-native";
import Header from "../../../../Header";
import NoContent from "../../../../NoContent";
import ScreenLayout from "../../../../ScreenLayout";
import useFocus from "../../../../useFocus";
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
