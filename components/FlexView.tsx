import { StyleSheet, View } from "react-native";
import { FLEX_ONE } from "../config/constants.config";
import ProviderType from "../types/ProviderType";

const FlexView: ProviderType = ({ children }) => {
	return <View style={styles.flexView}>{children}</View>;
};

const styles = StyleSheet.create({ flexView: { flex: FLEX_ONE } });

export default FlexView