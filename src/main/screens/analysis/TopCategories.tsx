import { View } from "react-native";
import CustomText from "../../components/CustomText";
import { LARGE_FONT_SIZE, PADDING } from "../../constants/constants.config";
import RelationWithTotal from "../../types/RelationWithTotal";
import { RelationRenderItemImplementation } from "../relation/RelationRenderItem";

const TopCategories = ({ relations }: { relations: RelationWithTotal[] }) => {
	if (relations.length === 0) return null;
	return (
		<View style={{ padding: PADDING }}>
			<CustomText text={"Top Categories"} fontSize={LARGE_FONT_SIZE} />
			{relations.map((relation) => (
				<RelationRenderItemImplementation
					item={relation}
					key={relation.id}
					total={relation.total}
				/>
			))}
		</View>
	);
};

export default TopCategories;
