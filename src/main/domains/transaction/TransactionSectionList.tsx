import { SectionList, StyleSheet, View } from "react-native";
import CustomText from "../../components/CustomText";
import {
	BORDER_RADIUS,
	CENTER,
	FLEX_ROW,
	LARGE_FONT_SIZE,
	PADDING,
	SPACE_BETWEEN,
} from "../../constants/constants.config";
import IGroupedTransaction from "./IGroupedTransaction";
import ITransaction from "./ITransaction";
import TransactionRenderItem from "./TransactionRenderItem";

const TransactionSectionList = ({ transactions }: ITransactionSectionList) => {
	return (
		<SectionList
			sections={transactions}
			keyExtractor={Key}
			renderSectionHeader={SectionHeader}
			renderItem={Item}
		/>
	);
};

type ITransactionSectionList = {
	transactions: IGroupedTransaction[];
};

type ISectionHeader = { section: { title: string } };

const Key = (item: ITransaction, index: number) => `${item.id}-${index}`;

const SectionHeader = ({ section }: ISectionHeader) => (
	<View style={styles.list}>
		<CustomText
			text={section.title}
			fontSize={LARGE_FONT_SIZE}
			alignSelf={CENTER}
		/>
	</View>
);

const Item = ({ item }: { item: ITransaction }) => (
	<TransactionRenderItem item={item} />
);

const styles = StyleSheet.create({
	list: {
		paddingVertical: PADDING,
		borderRadius: BORDER_RADIUS,
		flexDirection: FLEX_ROW,
		justifyContent: SPACE_BETWEEN,
	},
});
export default TransactionSectionList;
