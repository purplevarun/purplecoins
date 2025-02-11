import { FlashList } from "@shopify/flash-list";
import { useState } from "react";
import CustomText from "../../components/CustomText";
import Header from "../../components/Header";
import NoContent from "../../components/NoContent";
import ScreenLayout from "../../components/ScreenLayout";
import { CENTER, FONT_SIZE } from "../../constants/constants.config";
import RelationType from "../../constants/enums/RelationType";
import useDatabase from "../../hooks/useDatabase";
import useFocus from "../../hooks/useFocus";
import useScreen from "../../hooks/useScreen";
import Relation from "../../models/Relation";
import { calculateTotal, formatMoney } from "../../util/HelperFunctions";
import relationMap from "./RelationMap";
import RelationRenderItem from "./RelationRenderItem";

const RelationMainScreen = ({ route }: any) => {
	const relationType = route.params.relation as RelationType;
	const [relations, setRelations] = useState<Relation[]>([]);
	const navigate = useScreen();
	const { fetchAllRelations } = useDatabase();
	const relation = relationMap[relationType];
	useFocus(() => setRelations(fetchAllRelations(relationType)));
	if (relations.length === 0)
		return (
			<NoContent
				handlePlus={() => navigate(relation.routes.add)}
				text={plural(relation.name)}
			/>
		);
	return (
		<ScreenLayout>
			<Header handlePlus={() => navigate(relation.routes.add)} />
			<DisplayTotal relation={relationType} />
			<FlashList
				data={relations}
				renderItem={RelationRenderItem}
				estimatedItemSize={5}
			/>
		</ScreenLayout>
	);
};

const DisplayTotal = ({ relation }: { relation: RelationType }) => {
	if (relation !== RelationType.SOURCE) return null;
	const { fetchAllTransactions } = useDatabase();
	const total = calculateTotal(fetchAllTransactions(), true);
	return (
		<CustomText
			text={`Total Balance = ${formatMoney(total)}`}
			alignSelf={CENTER}
			fontSize={FONT_SIZE * 1.2}
			paddingVertical={FONT_SIZE}
		/>
	);
};

const plural = (text: string) => {
	if (text === "Category") return "Categories";
	return text + "s";
};

export default RelationMainScreen;
