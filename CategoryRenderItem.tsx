import { useNavigation } from "@react-navigation/native";
import { StyleSheet, TouchableOpacity } from "react-native";
import { SECONDARY_COLOR } from "./colors.config";
import { BORDER_RADIUS, MARGIN, PADDING } from "./constants.config";
import CustomText from "./CustomText";
import ICategory from "./ICategory";
import Routes from "./Routes";

const CategoryRenderItem = ({ item }: { item: ICategory }) => {
	const { navigate } = useNavigation<any>();
	return (
		<TouchableOpacity
			style={styles.btn}
			onPress={() =>
				navigate(Routes.Category.Detail, { categoryId: item.id })
			}
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
