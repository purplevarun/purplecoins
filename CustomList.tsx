import { useRoute } from "@react-navigation/native";
import { FlatList, SectionList, View } from "react-native";
import CustomText from "./CustomText";
import IGroupedTransaction from "./IGroupedTransaction";
import ISource from "./ISource";
import ITransaction from "./ITransaction";
import SourceRenderItem from "./SourceRenderItem";
import TransactionRenderItem from "./TransactionRenderItem";
import {
	BORDER_RADIUS,
	CENTER,
	FLEX_ROW,
	LARGE_FONT_SIZE,
	PADDING,
	SPACE_BETWEEN,
} from "./constants.config";

const CustomList = ({ data }: { data: ISource[] | IGroupedTransaction[] }) => {
	const { name: screenName } = useRoute();
	const name = screenName.split(".")[0];

	if (name === "Source") return <SourceFlatList data={data} />;
	if (name === "Transaction") return <TransactionSectionList data={data} />;
};

const SourceFlatList = ({
	data,
}: {
	data: ISource[] | IGroupedTransaction[];
}) => {
	return (
		<FlatList
			data={data as ISource[]}
			renderItem={({ item }) => <SourceRenderItem item={item} />}
		/>
	);
};

const TransactionSectionList = ({
	data,
}: {
	data: ISource[] | IGroupedTransaction[];
}) => {
	return (
		<SectionList
			sections={data as IGroupedTransaction[]}
			keyExtractor={(item: ITransaction, index: number) =>
				`${item.id}-${index}`
			}
			renderSectionHeader={({
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
			)}
			renderItem={({ item }: { item: ITransaction }) => (
				<TransactionRenderItem item={item} />
			)}
		/>
	);
};

export default CustomList;
