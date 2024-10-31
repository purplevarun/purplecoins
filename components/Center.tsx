import { CENTER, PADDING } from "../config/constants.config";
import { View } from "react-native";
import ProviderType from "../types/ProviderType";

const Center: ProviderType = ({ children }) => {
	return (
		<View
			style={{
				justifyContent: CENTER,
				padding: PADDING,
			}}
		>
			{children}
		</View>
	);
};
export default Center;
