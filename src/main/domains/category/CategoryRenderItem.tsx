import { StyleSheet, TouchableOpacity } from "react-native";
import CustomText from "../../components/CustomText";
import { SECONDARY_COLOR } from "../../constants/colors.config";
import {
	BORDER_RADIUS,
	MARGIN,
	PADDING,
} from "../../constants/constants.config";
import ICategory from "./ICategory";
import useCategory from "./useCategory";

const CategoryRenderItem = ({ item }: { item: ICategory }) => {
	return <Implementation item={item} />;
};

const Implementation = ({ item }: { item: ICategory }) => {
	const { handleDetail } = useCategory(item.id);
	return (
		<TouchableOpacity style={styles.btn} onPress={handleDetail}>
			<CustomText text={item.name} />
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	btn: {
		backgroundColor: SECONDARY_COLOR,
		borderRadius: BORDER_RADIUS,
		padding: PADDING,
		margin: MARGIN,
	},
});

export default CategoryRenderItem;
