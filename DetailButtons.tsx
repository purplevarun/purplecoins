import { View } from "react-native";
import useAppStore from "./AppStore";
import DeleteButton from "./DeleteButton";
import EditButton from "./EditButton";
import { CENTER, FLEX_END, FLEX_ROW, PADDING } from "./constants.config";

const DetailButtons = () => {
	const { onEdit, onDelete } = useAppStore();
	return (
		<View
			style={{
				flexDirection: FLEX_ROW,
				justifyContent: FLEX_END,
				gap: PADDING / 2,
				alignItems: CENTER,
				right: PADDING,
			}}
		>
			<EditButton onPress={onEdit} />
			<DeleteButton onDelete={onDelete} />
		</View>
	);
};

export default DetailButtons;
