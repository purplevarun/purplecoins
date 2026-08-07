import CustomText from "@/components/CustomText";
import ScreenContainer from "@/components/ScreenContainer";
import COLORS from "@/constants/colors";
import type RootStackParamList from "@/types/RootStackParamList";
import type { LogEntry, LogLevel } from "@/utils/logger";
import logger from "@/utils/logger";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

type AppLogsScreenProps = NativeStackScreenProps<RootStackParamList, "AppLogs">;

const LEVEL_COLORS: Record<LogLevel, string> = {
	info: COLORS.text,
	warn: COLORS.warning,
	error: COLORS.danger,
};

const LEVEL_BG: Record<LogLevel, string> = {
	info: "rgba(255,255,255,0.04)",
	warn: "rgba(245,185,91,0.10)",
	error: "rgba(255,107,134,0.12)",
};

const formatTime = (ts: number): string =>
	new Date(ts).toLocaleTimeString("en-IN", {
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: false,
	});

const formatDate = (ts: number): string =>
	new Date(ts).toLocaleDateString("en-IN", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	});

const LogRow = ({ entry }: { entry: LogEntry }): React.JSX.Element => {
	const [expanded, setExpanded] = useState(false);
	return (
		<Pressable
			onPress={() => entry.detail ? setExpanded((v) => !v) : undefined}
			style={[styles.row, { backgroundColor: LEVEL_BG[entry.level] }]}
		>
			<View style={styles.rowHeader}>
				<CustomText style={[styles.level, { color: LEVEL_COLORS[entry.level] }]}>
					{entry.level.toUpperCase()}
				</CustomText>
				<CustomText style={styles.time}>
					{formatDate(entry.timestamp)} {formatTime(entry.timestamp)}
				</CustomText>
				{entry.detail ? (
					<Ionicons
						color={COLORS.textDim}
						name={expanded ? "chevron-up" : "chevron-down"}
						size={12}
					/>
				) : null}
			</View>
			<CustomText style={styles.message}>{entry.message}</CustomText>
			{expanded && entry.detail ? (
				<CustomText style={styles.detail}>{entry.detail}</CustomText>
			) : null}
		</Pressable>
	);
};

const AppLogsScreen = ({ }: AppLogsScreenProps): React.JSX.Element => {
	const [logs, setLogs] = useState(() => logger.getLogs());

	const handleRefresh = useCallback((): void => {
		setLogs(logger.getLogs());
	}, []);

	const handleClear = useCallback((): void => {
		logger.clearLogs();
		setLogs([]);
	}, []);

	return (
		<ScreenContainer>
			<View style={styles.toolbar}>
				<Pressable onPress={handleRefresh} style={styles.toolbarButton}>
					<Ionicons color={COLORS.primaryBright} name="refresh-outline" size={18} />
					<CustomText style={styles.toolbarLabel}>Refresh</CustomText>
				</Pressable>
				<Pressable onPress={handleClear} style={styles.toolbarButton}>
					<Ionicons color={COLORS.danger} name="trash-outline" size={18} />
					<CustomText style={[styles.toolbarLabel, { color: COLORS.danger }]}>Clear</CustomText>
				</Pressable>
				<CustomText style={styles.count}>{logs.length} entries</CustomText>
			</View>
			{logs.length === 0 ? (
				<View style={styles.empty}>
					<Ionicons color={COLORS.textDim} name="document-text-outline" size={40} />
					<CustomText style={styles.emptyText}>No log entries yet.</CustomText>
				</View>
			) : (
				<View style={styles.list}>
					{logs.map((entry) => (
						<LogRow entry={entry} key={entry.id} />
					))}
				</View>
			)}
		</ScreenContainer>
	);
};

const styles = StyleSheet.create({
	toolbar: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
		marginBottom: 6,
	},
	toolbarButton: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
		paddingVertical: 6,
		paddingHorizontal: 10,
		borderRadius: 8,
		backgroundColor: "rgba(255,255,255,0.05)",
	},
	toolbarLabel: {
		color: COLORS.primaryBright,
		fontSize: 13,
		fontWeight: "700",
	},
	count: {
		marginLeft: "auto",
		color: COLORS.textMuted,
		fontSize: 12,
	},
	list: {
		gap: 4,
	},
	row: {
		borderRadius: 8,
		padding: 10,
		gap: 4,
	},
	rowHeader: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	level: {
		fontSize: 10,
		fontWeight: "900",
		letterSpacing: 0.8,
		minWidth: 36,
	},
	time: {
		color: COLORS.textDim,
		fontSize: 10,
		flex: 1,
	},
	message: {
		color: COLORS.text,
		fontSize: 13,
		lineHeight: 18,
	},
	detail: {
		color: COLORS.textMuted,
		fontSize: 11,
		lineHeight: 16,
		fontFamily: "monospace",
		marginTop: 4,
	},
	empty: {
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 60,
		gap: 12,
	},
	emptyText: {
		color: COLORS.textDim,
		fontSize: 14,
	},
});

export default AppLogsScreen;
