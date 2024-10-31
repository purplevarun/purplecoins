import { View } from "react-native";
import { MARGIN } from "../config/constants.config";

const Vertical = ({ size = 1 }: { size?: number }) => {
	return <View style={{ height: MARGIN * size }} />;
};

export default Vertical;
