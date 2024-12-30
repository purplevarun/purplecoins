import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { FlatList } from "react-native";
import ScreenLayout from "./ScreenLayout";
import PlusButton from "./PlusButton";
import NoContent from "./NoContent";
import InvestmentAnalysis from "./InvestementAnalysis";
import InvestmentRenderItem from "./InvestmentRenderItem";
import IInvestment from "./IInvestment";
import useInvestmentService from "./InvestmentService";
import Routes from "./Routes";

const InvestmentMain = () => {
	const { fetchInvestments } = useInvestmentService();
	const [investments, setInvestments] = useState<null | IInvestment[]>(null);

	useFocusEffect(useCallback(() => setInvestments(fetchInvestments()), []));

	if (!investments || investments.length === 0)
		return <NoContent investments />;

	return (
		<ScreenLayout>
			<InvestmentAnalysis investments={investments} />
			<FlatList data={investments} renderItem={InvestmentRenderItem} />
			<PlusButton to={Routes.Investment.Add} />
		</ScreenLayout>
	);
};

export default InvestmentMain;
