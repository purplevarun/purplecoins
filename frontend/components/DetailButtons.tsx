import {
	CENTER,
	FLEX_END,
	FLEX_ROW,
	PADDING,
} from "../config/constants.config";
import { View } from "react-native";
import EditButton from "./EditButton";
import DeleteButton from "./DeleteButton";
import useAppStore from "../AppStore";

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
