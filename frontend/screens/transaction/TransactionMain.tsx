import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { SectionList, StyleSheet, View } from "react-native";
import ITransaction from "../../interfaces/ITransaction";
import {
	BORDER_RADIUS,
	CENTER,
	FLEX_ROW,
	LARGE_FONT_SIZE,
	PADDING,
	SPACE_BETWEEN,
} from "../../config/constants.config";
import ScreenLayout from "../../components/ScreenLayout";
import PlusButton from "../../components/PlusButton";
import TransactionRenderItem from "./TransactionRenderItem";
import NoContent from "../../NoContent";
import useTransactionService from "./TransactionService";
import CustomText from "../../components/CustomText";
import Routes from "../../Routes";
import IGroupedTransactions from "../../interfaces/IGroupedTransactions";

const TransactionMain = () => {
	const { fetchGroupedTransactions } = useTransactionService();
	const [transactions, setTransactions] =
		useState<null | IGroupedTransactions>(null);

	useFocusEffect(
		useCallback(() => setTransactions(fetchGroupedTransactions()), []),
	);

	if (!transactions || transactions.length === 0)
		return <NoContent transactions />;

	return (
		<ScreenLayout>
			<SectionList
				sections={transactions}
				keyExtractor={KeyExtractor}
				renderSectionHeader={SectionHeader}
				renderItem={RenderItem}
			/>
			<PlusButton to={Routes.Transaction.Add} />
		</ScreenLayout>
	);
};

const KeyExtractor = (item: ITransaction, index: number) =>
	`${item.id}-${index}`;

const RenderItem = ({ item }: { item: ITransaction }) => (
	<TransactionRenderItem item={item} />
);

const SectionHeader = ({
	section: { title },
}: {
	section: { title: string };
}) => (
	<View style={styles.header}>
		<CustomText
			text={title}
			fontSize={LARGE_FONT_SIZE}
			alignSelf={CENTER}
		/>
	</View>
);

const styles = StyleSheet.create({
	header: {
		paddingVertical: PADDING,
		borderRadius: BORDER_RADIUS,
		flexDirection: FLEX_ROW,
		justifyContent: SPACE_BETWEEN,
	},
});

export default TransactionMain;
