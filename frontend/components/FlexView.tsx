import { StyleSheet, View } from "react-native";
import { FLEX_ONE } from "../config/constants.config";
import { SECONDARY_COLOR } from "../config/colors.config";
import ProviderType from "../types/ProviderType";

const FlexView = ({ children }: ProviderType) => {
	return <View style={styles.flexView}>{children}</View>;
};

const styles = StyleSheet.create({ flexView: { flex: FLEX_ONE, backgroundColor: SECONDARY_COLOR } });

export default FlexView;
