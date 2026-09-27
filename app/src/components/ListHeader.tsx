import type { PropsWithChildren, ReactElement } from "react";
import { StyleSheet, View } from "react-native";

import styleConstants from "@/constants/styleConstants";

const ListHeader = ({
	children,
}: PropsWithChildren): ReactElement<PropsWithChildren> => (
	<View style={styles.header}>{children}</View>
);

const { SPACING } = styleConstants;

const styles = StyleSheet.create({
	header: {
		gap: SPACING.S14,
		paddingTop: SPACING.S16,
		paddingBottom: SPACING.S14,
	},
});

export default ListHeader;
