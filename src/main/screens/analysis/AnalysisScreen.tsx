import { useState } from "react";
import { transactionRoutes } from "../../app/router/Routes";
import Header from "../../components/Header";
import ScreenLayout from "../../components/ScreenLayout";
import useScreen from "../../hooks/useScreen";
import RelationWithTotal from "../../types/RelationWithTotal";
import DateFilter from "./DateFilter";
import PredefinedRange from "./PredefinedRange";
import Sectors from "./Sectors";

const AnalysisScreen = () => {
	const [relations, setRelations] = useState<RelationWithTotal[]>([]);
	const navigation = useScreen();
	const [customStartDate, setCustomStartDate] = useState("");
	const [customEndDate, setCustomEndDate] = useState("");

	return (
		<ScreenLayout>
			<Header handleClose={() => navigation(transactionRoutes.main)} />
			<PredefinedRange
				setCustomStartDate={setCustomStartDate}
				setCustomEndDate={setCustomEndDate}
			/>
			<DateFilter
				setRelations={setRelations}
				customStartDate={customStartDate}
				customEndDate={customEndDate}
				setCustomStartDate={setCustomStartDate}
				setCustomEndDate={setCustomEndDate}
			/>
			<Sectors relations={relations} />
		</ScreenLayout>
	);
};

export default AnalysisScreen;
