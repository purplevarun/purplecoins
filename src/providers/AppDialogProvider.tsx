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
import AppDialogContext from "@/providers/AppDialogContext";
import type AppDialogConfirmOptions from "@/types/AppDialogConfirmOptions";
import type AppDialogContextValue from "@/types/AppDialogContextValue";
import type AppDialogMessageOptions from "@/types/AppDialogMessageOptions";
import type ButtonVariant from "@/types/ButtonVariant";

type ActiveDialog =
	| Readonly<{
			mode: "CONFIRM";
			options: AppDialogConfirmOptions;
	  }>
	| Readonly<{
			mode: "MESSAGE";
			options: AppDialogMessageOptions;
	  }>;

type DialogAccent = "default" | "success" | "danger" | "warning";

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

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		padding: 22,
		backgroundColor: "rgba(0,0,0,0.62)",
	},
	scrim: {
		...StyleSheet.absoluteFill,
	},
	cardHost: {
		width: "100%",
		maxWidth: 420,
	},
	content: {
		gap: 14,
	},
	iconBox: {
		width: 50,
		height: 50,
		borderRadius: 17,
		alignItems: "center",
		justifyContent: "center",
	},
	copy: {
		gap: 6,
	},
	title: {
		color: COLORS.text,
		fontSize: 20,
		fontWeight: "900",
	},
	message: {
		color: COLORS.textMuted,
		fontSize: 13,
		lineHeight: 20,
	},
	actions: {
		flexDirection: "row",
		justifyContent: "flex-end",
		gap: 8,
		marginTop: 2,
	},
});

export default AppDialogProvider;
