import { StyleSheet, View } from "react-native";
import { FLEX_ROW, MARGIN, SPACE_BETWEEN } from "../config/constants.config";
import CustomText from "./CustomText";

const DataTab = ({
	name,
	value,
}: {
	name: string;
	value: string | number | undefined;
}) => {
	if (value)
		return (
			<View style={styles.tab}>
				<CustomText text={name} />
				<CustomText text={value} />
			</View>
		);
};

const styles = StyleSheet.create({
	tab: {
		justifyContent: SPACE_BETWEEN,
		flexDirection: FLEX_ROW,
		margin: MARGIN,
	},
});

export default DataTab;
