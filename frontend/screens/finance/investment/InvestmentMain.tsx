import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { IInvestment } from "../../../util/database/DatabaseSchema";
import { FlatList } from "react-native";
import ScreenLayout from "../../../components/ScreenLayout";
import InvestmentRoutes from "./InvestmentRoutes";
import PlusButton from "../../../components/PlusButton";
import NoContent from "../../other/NoContent";
import useDatabase from "../../../util/database/DatabaseFunctions";
import InvestmentAnalysis from "./InvestementAnalysis";
import InvestmentRenderItem from "./InvestmentRenderItem";

const InvestmentMain = () => {
	const { getInvestments } = useDatabase();
	const [investments, setInvestments] = useState<null | IInvestment[]>(null);

	useFocusEffect(useCallback(() => {
		setInvestments(getInvestments());
	}, []));

	if (!investments || investments.length === 0)
		return <NoContent investments />;

	return (
		<ScreenLayout>
			<InvestmentAnalysis investments={investments} />
			<FlatList
				data={investments}
				renderItem={InvestmentRenderItem}
			/>
			<PlusButton to={InvestmentRoutes.Add} />
		</ScreenLayout>
	);
};


export default InvestmentMain;
