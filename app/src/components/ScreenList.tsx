import { FlashList } from "@shopify/flash-list";
import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import COLORS from "@/constants/colors";
import styleConstants from "@/constants/styleConstants";
import type ScreenListProps from "@/types/ScreenListProps";

const ListSeparator = (): ReactNode => <View style={styles.separator} />;

const ScreenList = <T,>({
	ItemSeparatorComponent = ListSeparator,
	...props
}: ScreenListProps<T>): ReactNode => {
	return (
		<LinearGradient
			colors={[COLORS.background, "#0E1020", "#090B14"]}
			style={styles.gradient}
		>
			<SafeAreaView edges={["bottom"]} style={styles.safeArea}>
				<FlashList
					{...props}
					ItemSeparatorComponent={ItemSeparatorComponent}
					contentContainerStyle={styles.listContent}
					keyboardShouldPersistTaps="handled"
					showsVerticalScrollIndicator={false}
				/>
			</SafeAreaView>
		</LinearGradient>
	);
};

const { FLEX, SIZES, SPACING } = styleConstants;

const styles = StyleSheet.create({
	gradient: {
		flex: FLEX.FILL,
	},
	safeArea: {
		flex: FLEX.FILL,
	},
	listContent: {
		paddingHorizontal: SPACING.S16,
		paddingBottom: SPACING.S120,
	},
	separator: {
		height: SIZES.S14,
	},
});

export default ScreenList;
