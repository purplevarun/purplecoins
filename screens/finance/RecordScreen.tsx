import { NativeSyntheticEvent, NativeScrollEvent, View } from "react-native";
import { FONT_SIZE } from "../../config/Constants";
import { FlashList } from "@shopify/flash-list";
import { useCallback, useState } from "react";
import { useQuery } from "@realm/react";
import Layout from "../../components/Layout";
import MyText from "../../components/MyText";
import AddButton from "../../components/AddButton";
import Transaction from "../../models/Transaction";
import AddTransactionModal from "../../components/AddTransactionModal";
import useTransaction from "../../stores/TransactionStore";

const TransactionScreen = () => {
	const [bottom, setBottom] = useState(FONT_SIZE / 2);
	const onScroll = useCallback(
		(event: NativeSyntheticEvent<NativeScrollEvent>) => {
			const { contentOffset, contentSize, layoutMeasurement } =
				event.nativeEvent;
			const reachedBottom =
				layoutMeasurement.height + contentOffset.y >=
				contentSize.height;
			if (reachedBottom) {
				setBottom(FONT_SIZE * 3);
			} else {
				setBottom(FONT_SIZE / 2);
			}
		},
		[],
	);
	const { showAddTransactionModal } = useTransaction();
	const transactions = useQuery(Transaction);
	console.log(transactions);
	return (
		<Layout>
			<FlashList
				// @ts-ignore
				data={transactions}
				renderItem={({ item }) => (
					<View>
						<MyText
							// @ts-ignore
							text={"amount = " + JSON.stringify(item.amount)}
						/>
					</View>
				)}
				estimatedItemSize={1}
				onScroll={onScroll}
			/>
			<AddButton bottom={bottom} />
			{showAddTransactionModal && <AddTransactionModal />}
		</Layout>
	);
};

export default TransactionScreen;
