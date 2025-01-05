import { SectionList, View } from "react-native";
import CustomText from "./CustomText";
import IGroupedTransaction from "./IGroupedTransaction";
import ITransaction from "./ITransaction";
import TransactionRenderItem from "./TransactionRenderItem";
import {
	BORDER_RADIUS,
	CENTER,
	FLEX_ROW,
	LARGE_FONT_SIZE,
	PADDING,
	SPACE_BETWEEN,
} from "./constants.config";

const TransactionSectionList = ({
	transactions,
}: {
	transactions: IGroupedTransaction[];
}) => {
	const keyExtractor = (item: ITransaction, index: number) =>
		`${item.id}-${index}`;
	const renderSectionHeader = ({
		section: { title },
	}: {
		section: { title: string };
	}) => (
		<View
			style={{
				paddingVertical: PADDING,
				borderRadius: BORDER_RADIUS,
				flexDirection: FLEX_ROW,
				justifyContent: SPACE_BETWEEN,
			}}
		>
			<CustomText
				text={title}
				fontSize={LARGE_FONT_SIZE}
				alignSelf={CENTER}
			/>
		</View>
	);
	const renderItem = ({ item }: { item: ITransaction }) => (
		<TransactionRenderItem item={item} />
	);

	return (
		<SectionList
			sections={transactions}
			keyExtractor={keyExtractor}
			renderSectionHeader={renderSectionHeader}
			renderItem={renderItem}
		/>
	);
};

export default TransactionSectionList;
