import { View } from "react-native";
import IProvider from "./IProvider";
import { CENTER, FLEX_ROW, SPACE_BETWEEN } from "./constants.config";

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
