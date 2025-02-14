import { useState } from "react";
import { transactionRoutes } from "../../app/router/Routes";
import Header from "../../components/Header";
import ScreenLayout from "../../components/ScreenLayout";
import useDatabase from "../../hooks/useDatabase";
import useScreen from "../../hooks/useScreen";
import RelationWithTotal from "../../types/RelationWithTotal";
import DateFilter from "./DateFilter";
import PredefinedRange from "./PredefinedRange";
import TopCategories from "./TopCategories";

const AnalysisScreen = () => {
	const [relations, setRelations] = useState<RelationWithTotal[]>([]);
	const navigation = useScreen();
	const [customStartDate, setCustomStartDate] = useState("");
	const [customEndDate, setCustomEndDate] = useState("");
	const { fetchBreakdown } = useDatabase();
	const onFind = () =>
		setRelations(fetchBreakdown(customStartDate, customEndDate));
	return (
		<ScreenLayout>
			<Header handleClose={() => navigation(transactionRoutes.main)} />
			<PredefinedRange
				setCustomStartDate={setCustomStartDate}
				setCustomEndDate={setCustomEndDate}
			/>
			<DateFilter
				onFind={onFind}
				customStartDate={customStartDate}
				customEndDate={customEndDate}
				setCustomStartDate={setCustomStartDate}
				setCustomEndDate={setCustomEndDate}
			/>
			<TopCategories relations={relations} />
		</ScreenLayout>
	);
};

export default AnalysisScreen;
