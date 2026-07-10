import { FlashList, type FlashListProps } from "@shopify/flash-list";
import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import COLORS from "@/constants/colors";

type ScreenListProps<T> = Readonly<
	Omit<FlashListProps<T>, "contentContainerStyle">
>;

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

const styles = StyleSheet.create({
	gradient: {
		flex: 1,
	},
	safeArea: {
		flex: 1,
	},
	listContent: {
		paddingHorizontal: 16,
		paddingBottom: 120,
	},
	separator: {
		height: 14,
	},
});

export default ScreenList;
