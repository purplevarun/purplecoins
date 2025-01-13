import { View } from "react-native";
import IProvider from "./IProvider";
import { CENTER, FLEX_ROW, NINETY_P, SPACE_BETWEEN } from "./constants.config";

const PaddedRow: IProvider = ({ children }) => {
	return (
		<View
			style={{
				flexDirection: FLEX_ROW,
				width: NINETY_P,
				alignSelf: CENTER,
				justifyContent: SPACE_BETWEEN,
			}}
			children={children}
		/>
	);
};

export default PaddedRow;
