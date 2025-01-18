import { TouchableOpacity } from "react-native";
import CustomText from "../../components/CustomText";
import {
	GREEN_COLOR,
	RED_COLOR,
	SECONDARY_COLOR,
} from "../../constants/colors.config";
import {
	BORDER_RADIUS,
	MARGIN,
	PADDING,
} from "../../constants/constants.config";
import Action from "../../constants/enums/Action";
import ICategory from "./ICategory";
import useCategory from "./useCategory";

const CategoryRenderItem = ({ item }: { item: ICategory }) => {
	return <Implementation item={item} />;
};

const Implementation = ({ item }: { item: ICategory }) => {
	const { handleDetail, fetchTransactionsForCategory } = useCategory(item.id);
	const total = fetchTransactionsForCategory().reduce(
		(total, { action, amount }) =>
			action === Action.DEBIT ? total - amount : total + amount,
		0,
	);
	return (
		<TouchableOpacity
			style={{
				backgroundColor: SECONDARY_COLOR,
				borderRadius: BORDER_RADIUS,
				padding: PADDING,
				margin: MARGIN,
				borderWidth: total == 0 ? 0 : 2,
				borderColor: total < 0 ? RED_COLOR : GREEN_COLOR,
			}}
			onPress={handleDetail}
		>
			<CustomText text={item.name} />
		</TouchableOpacity>
	);
};

export default CategoryRenderItem;
