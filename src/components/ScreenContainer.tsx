import { LinearGradient } from "expo-linear-gradient";
import type { PropsWithChildren, ReactNode } from "react";
import {
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	StyleSheet,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import COLORS from "@/constants/colors";

type ScreenContainerProps = PropsWithChildren<
	Readonly<{
		isScrollable?: boolean;
	}>
>;

const ScreenContainer = ({
	children,
	isScrollable = true,
}: ScreenContainerProps): ReactNode => {
	const content = isScrollable ? (
		<ScrollView
			contentContainerStyle={styles.scrollContent}
			keyboardShouldPersistTaps="handled"
			showsVerticalScrollIndicator={false}
		>
			{children}
		</ScrollView>
	) : (
		<View style={styles.staticContent}>{children}</View>
	);

	return (
		<LinearGradient
			colors={[COLORS.background, "#0E1020", "#090B14"]}
			style={styles.gradient}
		>
			<SafeAreaView edges={["bottom"]} style={styles.safeArea}>
				<KeyboardAvoidingView
					behavior={Platform.OS === "ios" ? "padding" : undefined}
					style={styles.keyboardView}
				>
					{content}
				</KeyboardAvoidingView>
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
	keyboardView: {
		flex: 1,
	},
	scrollContent: {
		padding: 16,
		paddingBottom: 120,
		gap: 14,
	},
	staticContent: {
		flex: 1,
		padding: 16,
	},
});

export default ScreenContainer;
