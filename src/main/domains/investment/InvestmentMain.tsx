import { FlashList } from "@shopify/flash-list";
import { useState } from "react";
import { investmentRoutes } from "../../app/router/Routes";
import Header from "../../components/Header";
import NoContent from "../../components/NoContent";
import ScreenLayout from "../../components/ScreenLayout";
import useDatabase from "../../hooks/useDatabase";
import useFocus from "../../hooks/useFocus";
import useScreen from "../../hooks/useScreen";
import IInvestment from "./IInvestment";
import InvestmentRenderItem from "./InvestmentRenderItem";

const InvestmentMain = () => {
	const [investments, setInvestments] = useState<IInvestment[]>([]);
	const { navigate } = useScreen();
	const { fetchAllInvestments } = useDatabase();
	const handlePlus = () => navigate(investmentRoutes.add);
	useFocus(() => setInvestments(fetchAllInvestments()));

	if (investments.length === 0) return <NoContent handlePlus={handlePlus} />;
	return (
		<ScreenLayout>
			<Header handlePlus={handlePlus} />
			<FlashList
				data={investments}
				renderItem={InvestmentRenderItem}
				estimatedItemSize={5}
			/>
		</ScreenLayout>
	);
};

export default InvestmentMain;
