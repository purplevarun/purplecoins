import { FlashList } from "@shopify/flash-list";
import { useState } from "react";
import { sourceRoutes } from "../../app/router/Routes";
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
import SourceRenderItem from "./SourceRenderItem";

const SourceMain = () => {
	const [sources, setSources] = useState<Relation[]>([]);
	const navigate = useScreen();
	const { fetchAllRelations, fetchAllTransactions } = useDatabase();
	const total = calculateTotal(fetchAllTransactions(), true);
	useFocus(() => setSources(fetchAllRelations(RelationType.SOURCE)));

	if (sources.length === 0)
		return (
			<NoContent
				handlePlus={() => navigate(sourceRoutes.add)}
				text={"Sources"}
			/>
		);
	return (
		<ScreenLayout>
			<Header handlePlus={() => navigate(sourceRoutes.add)} />
			<CustomText
				text={`Total Balance = ${formatMoney(total)}`}
				alignSelf={CENTER}
				fontSize={FONT_SIZE * 1.2}
				paddingVertical={FONT_SIZE}
			/>
			<FlashList
				data={sources}
				renderItem={SourceRenderItem}
				estimatedItemSize={3}
			/>
		</ScreenLayout>
	);
};

export default SourceMain;
