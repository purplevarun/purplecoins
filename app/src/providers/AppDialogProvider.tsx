import CustomText from "@/components/CustomText";
import { Ionicons } from "@expo/vector-icons";
import {
	useCallback,
	useMemo,
	useState,
	type PropsWithChildren,
	type ReactNode,
} from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";

import AppButton from "@/components/AppButton";
import GlassCard from "@/components/GlassCard";
import COLORS from "@/constants/colors";
import styleConstants from "@/constants/styleConstants";
import AppDialogContext from "@/providers/AppDialogContext";
import type ActiveDialog from "@/types/ActiveDialog";
import type AppDialogConfirmOptions from "@/types/AppDialogConfirmOptions";
import type AppDialogContextValue from "@/types/AppDialogContextValue";
import type AppDialogMessageOptions from "@/types/AppDialogMessageOptions";
import type ButtonVariant from "@/types/ButtonVariant";
import type DialogAccent from "@/types/DialogAccent";

const DEFAULT_CANCEL_LABEL = "Cancel";
const DEFAULT_CLOSE_LABEL = "Close";
const WARNING_ICON_COLOR = COLORS.warning;

const getDialogAccent = (variant?: ButtonVariant): DialogAccent => {
	if (variant === "danger") {
		return "danger";
	}
	if (variant === "success") {
		return "success";
	}
	return "warning";
};

const getDialogIconColor = (variant?: ButtonVariant): string => {
	if (variant === "danger") {
		return COLORS.danger;
	}
	if (variant === "success") {
		return COLORS.success;
	}
	return WARNING_ICON_COLOR;
};

const AppDialogProvider = ({ children }: PropsWithChildren): ReactNode => {
	const [activeDialog, setActiveDialog] = useState<ActiveDialog | null>(null);

	const handleClose = useCallback((): void => {
		setActiveDialog(null);
	}, []);

	const confirm = useCallback((options: AppDialogConfirmOptions): void => {
		setActiveDialog({ mode: "CONFIRM", options });
	}, []);

	const showMessage = useCallback(
		(options: AppDialogMessageOptions): void => {
			setActiveDialog({ mode: "MESSAGE", options });
		},
		[],
	);

	const value = useMemo(
		(): AppDialogContextValue => ({
			confirm,
			showMessage,
		}),
		[confirm, showMessage],
	);

	const options = activeDialog?.options;
	const variant = options?.variant;

	return (
		<AppDialogContext.Provider value={value}>
			{children}
			<Modal
				animationType="fade"
				onRequestClose={handleClose}
				transparent
				visible={Boolean(activeDialog)}
			>
				<View style={styles.overlay}>
					<Pressable onPress={handleClose} style={styles.scrim} />
					<View style={styles.cardHost}>
						<GlassCard accent={getDialogAccent(variant)}>
							<View style={styles.content}>
								<View
									style={[
										styles.iconBox,
										{
											backgroundColor: `${getDialogIconColor(
												variant,
											)}20`,
										},
									]}
								>
									<Ionicons
										color={getDialogIconColor(variant)}
										name={
											variant === "danger"
												? "warning-outline"
												: "sparkles-outline"
										}
										size={24}
									/>
								</View>
								<View style={styles.copy}>
									<CustomText style={styles.title}>
										{options?.title ?? ""}
									</CustomText>
									<CustomText style={styles.message}>
										{options?.message ?? ""}
									</CustomText>
								</View>
								<View style={styles.actions}>
									{activeDialog?.mode === "CONFIRM" ? (
										<>
											<AppButton
												isCompact
												label={
													activeDialog.options
														.cancelLabel ??
													DEFAULT_CANCEL_LABEL
												}
												onPress={handleClose}
												variant="secondary"
											/>
											<AppButton
												isCompact
												label={
													activeDialog.options
														.confirmLabel
												}
												onPress={() => {
													handleClose();
													activeDialog.options.onConfirm();
												}}
												variant={
													activeDialog.options
														.variant ?? "primary"
												}
											/>
										</>
									) : (
										<AppButton
											isCompact
											label={
												activeDialog?.options
													.closeLabel ??
												DEFAULT_CLOSE_LABEL
											}
											onPress={handleClose}
											variant={
												activeDialog?.options.variant ??
												"primary"
											}
										/>
									)}
								</View>
							</View>
						</GlassCard>
					</View>
				</View>
			</Modal>
		</AppDialogContext.Provider>
	);
};

const {
	ALIGN,
	FLEX,
	FONT_SIZE,
	FONT_WEIGHT,
	LINE_HEIGHT,
	RADIUS,
	SIZES,
	SPACING,
} = styleConstants;

const styles = StyleSheet.create({
	overlay: {
		flex: FLEX.FILL,
		alignItems: ALIGN.CENTER,
		justifyContent: ALIGN.CENTER,
		padding: SPACING.S22,
		backgroundColor: COLORS.overlay,
	},
	scrim: {
		...StyleSheet.absoluteFill,
	},
	cardHost: {
		width: SIZES.FULL,
		maxWidth: SIZES.S420,
	},
	content: {
		gap: SPACING.S14,
	},
	iconBox: {
		width: SIZES.S50,
		height: SIZES.S50,
		borderRadius: RADIUS.S17,
		alignItems: ALIGN.CENTER,
		justifyContent: ALIGN.CENTER,
	},
	copy: {
		gap: SPACING.S6,
	},
	title: {
		color: COLORS.text,
		fontSize: FONT_SIZE.S20,
		fontWeight: FONT_WEIGHT.BLACK,
	},
	message: {
		color: COLORS.textMuted,
		fontSize: FONT_SIZE.S13,
		lineHeight: LINE_HEIGHT.S20,
	},
	actions: {
		flexDirection: FLEX.ROW,
		justifyContent: ALIGN.END,
		gap: SPACING.S8,
		marginTop: SPACING.S2,
	},
});

export default AppDialogProvider;
