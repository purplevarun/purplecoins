import { FlashList } from "@shopify/flash-list";
import { View } from "react-native";
import CustomText from "../../components/CustomText";
import Vertical from "../../components/Vertical";
import { DISABLED_COLOR } from "../../constants/colors.config";
import { LARGE_FONT_SIZE, PADDING } from "../../constants/constants.config";
import ITransaction from "./ITransaction";
import TransactionRenderItem from "./TransactionRenderItem";

const LinkedTransactions = ({
	transactions,
}: {
	transactions: ITransaction[];
}) => {
	if (transactions.length > 0)
		return (
			<View style={{ paddingTop: PADDING, height: "80%" }}>
				<CustomText
					text={"Linked Transactions"}
					fontSize={LARGE_FONT_SIZE}
				/>
				<Vertical />
				<FlashList
					estimatedItemSize={100}
					data={transactions}
					renderItem={({ item }) => (
						<TransactionRenderItem item={item} />
					)}
				/>
			</View>
		);

	return (
		<View style={{ paddingTop: PADDING }}>
			<CustomText
				text={"No Linked Transactions"}
				color={DISABLED_COLOR}
				fontSize={LARGE_FONT_SIZE}
			/>
		</View>
	);
};

export default LinkedTransactions;
