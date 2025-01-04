import { FlatList, SectionList, View } from "react-native";
import CustomText from "./CustomText";
import IGroupedTransaction from "./IGroupedTransaction";
import ITransaction from "./ITransaction";
import service from "./Service";
import TransactionRenderItem from "./TransactionRenderItem";
import {
	BORDER_RADIUS,
	CENTER,
	FLEX_ROW,
	LARGE_FONT_SIZE,
	PADDING,
	SPACE_BETWEEN,
} from "./constants.config";
import ISource from "./source/ISource";
import SourceRenderItem from "./source/SourceRenderItem";
import useScreen from "./useScreen";

type IData = { data: ISource[] | IGroupedTransaction[] };
const CustomList = ({ data }: IData) => {
	const { serviceName } = useScreen();

	if (serviceName === service.source) return <SourceFlatList data={data} />;
	if (serviceName === service.transaction)
		return <TransactionSectionList data={data} />;
};

const SourceFlatList = ({ data }: IData) => {
	return (
		<FlatList
			data={data as ISource[]}
			renderItem={({ item }) => <SourceRenderItem item={item} />}
		/>
	);
};

const TransactionSectionList = ({ data }: IData) => {
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
