import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { FlatList } from "react-native";
import ScreenLayout from "../../../components/ScreenLayout";
import InvestmentRoutes from "./InvestmentRoutes";
import PlusButton from "../../../components/PlusButton";
import NoContent from "../../other/NoContent";
import InvestmentAnalysis from "./InvestementAnalysis";
import InvestmentRenderItem from "./InvestmentRenderItem";
import IInvestment from "../../../interfaces/IInvestment";
import useInvestmentService from "./InvestmentService";

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
			<PlusButton to={InvestmentRoutes.Add} />
		</ScreenLayout>
	);
};

export default InvestmentMain;
