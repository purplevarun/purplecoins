import { FlashList } from "@shopify/flash-list";
import { useState } from "react";
import { investmentRoutes } from "../../app/router/Routes";
import Header from "../../components/Header";
import NoContent from "../../components/NoContent";
import ScreenLayout from "../../components/ScreenLayout";
import RelationType from "../../constants/enums/RelationType";
import useDatabase from "../../hooks/useDatabase";
import useFocus from "../../hooks/useFocus";
import useScreen from "../../hooks/useScreen";
import Relation from "../../models/Relation";
import InvestmentRenderItem from "./InvestmentRenderItem";

const InvestmentMain = () => {
	const [investments, setInvestments] = useState<Relation[]>([]);
	const navigate = useScreen();
	const { fetchAllRelations } = useDatabase();
	useFocus(() => setInvestments(fetchAllRelations(RelationType.INVESTMENT)));

	if (investments.length === 0)
		return (
			<NoContent
				handlePlus={() => navigate(investmentRoutes.add)}
				text={"Investments"}
			/>
		);
	return (
		<ScreenLayout>
			<Header handlePlus={() => navigate(investmentRoutes.add)} />
			<FlashList
				data={investments}
				renderItem={InvestmentRenderItem}
				estimatedItemSize={5}
			/>
		</ScreenLayout>
	);
};

export default InvestmentMain;
