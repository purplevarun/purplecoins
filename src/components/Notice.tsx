import { CustomText } from "@/components/CustomText";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

import { COLORS } from "@/constants/colors";

type NoticeProps = Readonly<{
	message: string;
	tone?: "info" | "warning" | "danger";
}>;

const getToneColor = (tone: NoticeProps["tone"]): string => {
	if (tone === "danger") {
		return COLORS.danger;
	}
	if (tone === "warning") {
		return COLORS.warning;
	}
	return COLORS.blue;
};

const Notice = ({ message, tone = "info" }: NoticeProps): React.JSX.Element => {
	const color = getToneColor(tone);
	return (
		<View style={[styles.container, { borderColor: color }]}>
			<Ionicons
				color={color}
				name={tone === "danger" ? "alert-circle" : "information-circle"}
				size={20}
			/>
			<CustomText style={styles.message}>{message}</CustomText>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		borderWidth: 1,
		borderRadius: 14,
		padding: 12,
		backgroundColor: "rgba(255,255,255,0.035)",
		flexDirection: "row",
		gap: 9,
		alignItems: "flex-start",
	},
	message: {
		color: COLORS.textMuted,
		fontSize: 13,
		lineHeight: 19,
		flex: 1,
	},
});

export { Notice };
