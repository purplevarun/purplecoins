import type { PropsWithChildren, ReactElement } from "react";
import { StyleSheet, View } from "react-native";

const ListHeader = ({
	children,
}: PropsWithChildren): ReactElement<PropsWithChildren> => (
	<View style={styles.header}>{children}</View>
);

const styles = StyleSheet.create({
	header: {
		gap: 14,
		paddingTop: 16,
		paddingBottom: 14,
	},
});

export default ListHeader;
