import { CENTER, PADDING } from "../config/constants.config";
import { View } from "react-native";
import ProviderType from "../types/ProviderType";

const Center = ({ children }: ProviderType) => {
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
