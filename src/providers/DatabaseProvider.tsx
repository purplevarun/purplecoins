import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ActivityIndicator, Modal, StyleSheet, View } from "react-native";

import CustomText from "@/components/CustomText";
import COLORS from "@/constants/colors";
import DatabaseContext from "@/providers/DatabaseContext";
import type DatabaseContextValue from "@/types/DatabaseContextValue";
import type DatabaseProviderProps from "@/types/DatabaseProviderProps";

const DatabaseProvider = ({
	children,
	database,
}: DatabaseProviderProps): ReactNode => {
	const [dataVersion, setDataVersion] = useState(0);
	const [pendingOperations, setPendingOperations] = useState(0);
	const [showLoader, setShowLoader] = useState(false);

	useEffect(() => {
		const timeoutId = setTimeout(
			() => setShowLoader(pendingOperations > 0),
			pendingOperations > 0 ? 120 : 0,
		);
		return () => clearTimeout(timeoutId);
	}, [pendingOperations]);

	const trackedDatabase = useMemo(
		() =>
			new Proxy(database, {
				get(target, prop, receiver) {
					const value: unknown = Reflect.get(target, prop, receiver);
					if (typeof value !== "function") {
						return value;
					}

					return (...args: unknown[]): unknown => {
						const result: unknown = Reflect.apply(
							value,
							target,
							args,
						);
						if (result instanceof Promise) {
							setPendingOperations((current) => current + 1);
							return result.finally(() => {
								setPendingOperations((current) =>
									current > 0 ? current - 1 : 0,
								);
							});
						}

						return result;
					};
				},
			}),
		[database],
	);

	const refreshData = (): void => {
		setDataVersion((currentVersion) => currentVersion + 1);
	};

	const value: DatabaseContextValue = {
		database: trackedDatabase,
		dataVersion,
		refreshData,
	};

	return (
		<DatabaseContext.Provider value={value}>
			{children}
			<Modal transparent visible={pendingOperations > 0 && showLoader}>
				<View style={styles.loaderOverlay}>
					<View style={styles.loaderCard}>
						<ActivityIndicator
							color={COLORS.primary}
							size="large"
						/>
						<CustomText style={styles.loaderText}>
							Loading...
						</CustomText>
					</View>
				</View>
			</Modal>
		</DatabaseContext.Provider>
	);
};

const styles = StyleSheet.create({
	loaderOverlay: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "rgba(8,11,20,0.58)",
		padding: 24,
	},
	loaderCard: {
		minWidth: 150,
		paddingHorizontal: 18,
		paddingVertical: 16,
		borderRadius: 14,
		alignItems: "center",
		gap: 12,
		backgroundColor: COLORS.backgroundElevated,
		borderWidth: 1,
		borderColor: COLORS.borderStrong,
	},
	loaderText: {
		color: COLORS.textMuted,
		fontSize: 13,
		fontWeight: "700",
	},
});

export default DatabaseProvider;
