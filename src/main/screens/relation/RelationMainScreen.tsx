import { FlashList } from "@shopify/flash-list";
import { useState } from "react";
import RelationFinder from "../../components/finder/RelationFinder";
import Header from "../../components/header/Header";
import ScreenLayout from "../../components/layout/ScreenLayout";
import CustomText from "../../components/text/CustomText";
import { DISABLED_COLOR } from "../../constants/config/colors.config";
import {
	CENTER,
	FONT_SIZE,
	SCREEN_HEIGHT,
} from "../../constants/config/constants.config";
import RelationType from "../../constants/enums/RelationType";
import useDatabase from "../../hooks/useDatabase";
import useFocus from "../../hooks/useFocus";
import useScreen from "../../hooks/useScreen";
import Relation from "../../models/Relation";
import {
	calculateInvestmentTotal,
	calculateNetWorth,
	formatMoney,
} from "../../util/HelperFunctions";
import relationMap from "./RelationMap";
import RelationRenderItem from "./RelationRenderItem";

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
	const { fetchAllTransactions } = useDatabase();
	if (relation === RelationType.SOURCE) {
		const total = calculateNetWorth(fetchAllTransactions());
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
		const total = calculateInvestmentTotal(fetchAllTransactions());
		return (
			<CustomText
				text={`Total Invested Amount = ${formatMoney(Math.abs(total))}`}
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
