import { View } from "react-native";
import {
	CENTER,
	FLEX_ROW,
	SPACE_BETWEEN,
} from "./constants.config";
import IProvider from "./IProvider";

const PaddedRow: IProvider = ({ children }) => {
	return (
		<View
			style={{
				flexDirection: FLEX_ROW,
				width: "90%",
				alignSelf: CENTER,
				justifyContent: SPACE_BETWEEN,
			}}
			children={children}
		/>
	);
};

export default PaddedRow;
