import { FC } from "react";
import { StyleSheet, View } from "react-native";
import CustomText from "./CustomText";
import { FLEX_ROW, MARGIN, SPACE_BETWEEN } from "./constants.config";

type IDataTab = FC<{
	name: string;
	value: string | number | undefined;
}>;

const DataTab: IDataTab = ({ name, value }) => {
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
