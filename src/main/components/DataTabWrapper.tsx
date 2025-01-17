import { StyleSheet, View } from "react-native";
import { FLEX_ROW, MARGIN, SPACE_BETWEEN } from "../constants/constants.config";
import IProvider from "../types/IProvider";

const DataTabWrapper: IProvider = ({ children }) => {
	return <View style={styles.tab} children={children} />;
};

const styles = StyleSheet.create({
	tab: {
		justifyContent: SPACE_BETWEEN,
		flexDirection: FLEX_ROW,
		margin: MARGIN,
	},
});

export default DataTabWrapper;
