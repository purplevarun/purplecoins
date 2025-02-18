import { FlashList } from "@shopify/flash-list";
import { useState } from "react";
import CustomText from "./CustomText";
import Header from "./Header";
import { formatMoney } from "./HelperFunctions";
import Relation from "./Relation";
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
	useFocus(() => setRelations(fetchAllRelations(relationType)));

	return (
		<ScreenLayout>
			<Header
				handlePlus={() => navigate(relation.routes.add)}
				handleFind={() => setShowFinder((prev) => !prev)}
			/>
			<DisplayTotal relation={relationType} />
			{showFinder && (
				<RelationFinder
					setRelations={setRelations}
					type={relationType}
				/>
			)}
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

export default RelationMainScreen;
