import { FlashList } from "@shopify/flash-list";
import { useState } from "react";
import CustomText from "./CustomText";
import Header from "./Header";
import { convertStringToDate, formatMoney } from "./HelperFunctions";
import Relation from "./Relation";
import RelationFilter from "./RelationFilter";
import RelationFinder from "./RelationFinder";
import relationMap from "./RelationMap";
import RelationRenderItem from "./RelationRenderItem";
import RelationType from "./RelationType";
import ScreenLayout from "./ScreenLayout";
import { DISABLED_COLOR } from "./colors.config";
import { CENTER, FONT_SIZE, SCREEN_HEIGHT } from "./constants.config";
import useDatabase from "./useDatabase";
import useFocus from "./useFocus";
import useScreen from "./useScreen";

const RelationMainScreen = ({
	route,
}: {
	route?: { params: { relation: RelationType } };
}) => {
	const relationType = route!.params.relation;
	const [relations, setRelations] = useState<Relation[]>([]);
	const navigate = useScreen();
	const { fetchAllRelations } = useDatabase();
	const relation = relationMap[relationType];
	const [showFinder, setShowFinder] = useState(false);
	const [showFilter, setShowFilter] = useState(false);
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	useFocus(() => {
		if (startDate === "" && endDate === "") {
			setRelations(fetchAllRelations(relationType));
			return;
		}
		if (isValid(startDate, endDate)) {
			setRelations(fetchAllRelations(relationType, startDate, endDate));
			return;
		}
	}, [startDate, endDate]);

	return (
		<ScreenLayout>
			<Header
				handlePlus={() => navigate(relation.routes.add)}
				handleFind={() => setShowFinder((prev) => !prev)}
				handleFilter={() => {
					setShowFilter((prev) => !prev);
					setStartDate("");
					setEndDate("");
				}}
			/>
			<DisplayTotal relation={relationType} />
			<RelationFilter
				showFilter={showFilter}
				startDate={startDate}
				setStartDate={setStartDate}
				endDate={endDate}
				setEndDate={setEndDate}
			/>
			<RelationFinder
				showFinder={showFinder}
				setRelations={setRelations}
				type={relationType}
			/>
			{relations.length === 0 ? (
				<CustomText
					text={text(relation.name)}
					color={DISABLED_COLOR}
					paddingTop={SCREEN_HEIGHT / 4}
					alignSelf={CENTER}
				/>
			) : (
				<FlashList
					data={relations}
					renderItem={RelationRenderItem}
					estimatedItemSize={5}
				/>
			)}
		</ScreenLayout>
	);
};

const DisplayTotal = ({ relation }: { relation: RelationType }) => {
	const { fetchTotalForSource, fetchTotalForInvestment } = useDatabase();
	if (relation === RelationType.SOURCE) {
		const total = fetchTotalForSource()?.total;
		return (
			<CustomText
				text={`Total Balance = ${formatMoney(total)}`}
				alignSelf={CENTER}
				fontSize={FONT_SIZE * 1.2}
				paddingVertical={FONT_SIZE}
			/>
		);
	}
	if (relation === RelationType.INVESTMENT) {
		const total = fetchTotalForInvestment()?.total!;
		return (
			<CustomText
				text={`Current Investments = ${formatMoney(Math.abs(total))}`}
				alignSelf={CENTER}
				fontSize={FONT_SIZE * 1.2}
				paddingVertical={FONT_SIZE}
			/>
		);
	}
};

const text = (text: string) => {
	if (text === "Category") return "No Categories found";
	return `No ${text}s found`;
};

const isValid = (startDate: string, endDate: string) => {
	[startDate, endDate].forEach((date) => {
		if (date.length !== 10) return false;
		if (date.split("/").length !== 3) return false;
		const [d, m, y] = date.split("/");
		if (d.length !== 2 && m.length !== 2 && y.length !== 4) return false;
		if (parseInt(d) > 31 || parseInt(m) > 12) return false;
	});
	return (
		convertStringToDate(endDate).getTime() >=
		convertStringToDate(startDate).getTime()
	);
};

export default RelationMainScreen;
