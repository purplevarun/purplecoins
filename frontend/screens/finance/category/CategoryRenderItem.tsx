import { StyleSheet, TouchableOpacity } from "react-native";
import { SECONDARY_COLOR } from "../../../config/colors.config";
import {
	BORDER_RADIUS,
	MARGIN,
	PADDING,
} from "../../../config/constants.config";
import CustomText from "../../../components/CustomText";
import ICategory from "../../../interfaces/ICategory";
import useCategoryService from "./CategoryService";

const CategoryRenderItem = ({ item }: { item: ICategory }) => {
	const { selectCategory } = useCategoryService();
	return (
		<TouchableOpacity
			style={styles.btn}
			onPress={() => selectCategory(item.id)}
		>
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
