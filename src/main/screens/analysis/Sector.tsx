import { View } from "react-native";
import CustomText from "../../components/CustomText";
import { LARGE_FONT_SIZE, PADDING } from "../../constants/constants.config";
import RelationType from "../../constants/enums/RelationType";
import RelationWithTotal from "../../types/RelationWithTotal";
import RelationRenderItem from "../relation/RelationRenderItem";

const Sector = ({
	text,
	relations,
	type,
}: {
	text: string;
	relations: RelationWithTotal[];
	type: RelationType;
}) => {
	const breakdowns = relations
		.filter((relation) => relation.type === type)
		.sort((a, b) => b.total - a.total);
	if (breakdowns.length === 0) return null;
	return (
		<View style={{ padding: PADDING }}>
			<CustomText text={text} fontSize={LARGE_FONT_SIZE} />
			{breakdowns.map((relation) => (
				<RelationRenderItem item={relation} key={relation.id} />
			))}
		</View>
	);
};

export default Sector;
