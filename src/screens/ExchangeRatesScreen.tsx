import { CustomText } from "@/components/CustomText";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

import { AppButton } from "@/components/AppButton";
import { EmptyState } from "@/components/EmptyState";
import { GlassCard } from "@/components/GlassCard";
import { Notice } from "@/components/Notice";
import { ListHeader, ScreenList } from "@/components/ScreenList";
import { TextField } from "@/components/TextField";
import { DEFAULT_CURRENCY_CODE } from "@/constants/appConstants";
import { COLORS } from "@/constants/colors";
import { useDatabaseContext } from "@/hooks/useDatabaseContext";
import {
	fetchExchangeRates,
	getExchangeRates,
	saveManualExchangeRate,
} from "@/services/exchangeRateService";
import { getSources } from "@/services/sourceService";
import type { ExchangeRate } from "@/types/ExchangeRate";
import type { RootStackParamList } from "@/types/RootStackParamList";
import { formatDateTime } from "@/utils/date";
import { getErrorMessage } from "@/utils/error";
import { formatMoney } from "@/utils/money";

type ExchangeRatesScreenProps = NativeStackScreenProps<
	RootStackParamList,
	"ExchangeRates"
>;

const ExchangeRatesScreen = (
	_props: ExchangeRatesScreenProps,
): React.JSX.Element => {
	const { database, dataVersion, refreshData } = useDatabaseContext();
	const [currencies, setCurrencies] = useState<readonly string[]>([]);
	const [rates, setRates] = useState<readonly ExchangeRate[]>([]);
	const [drafts, setDrafts] = useState<Readonly<Record<string, string>>>({});
	const [isFetching, setIsFetching] = useState(false);
	const [error, setError] = useState("");
	const [message, setMessage] = useState("");

	const getScreenData = useCallback(async (): Promise<void> => {
		try {
			const [sources, loadedRates] = await Promise.all([
				getSources(database),
				getExchangeRates(database),
			]);
			const sourceCurrencies = [
				...new Set(
					sources
						.map((source) => source.currencyCode)
						.filter(
							(currencyCode) =>
								currencyCode !== DEFAULT_CURRENCY_CODE,
						),
				),
			].sort();
			setCurrencies(sourceCurrencies);
			setRates(loadedRates);
			setDrafts(
				Object.fromEntries(
					loadedRates.map((rate) => [
						rate.currencyCode,
						rate.rateToInr,
					]),
				),
			);
			setError("");
		} catch (caughtError: unknown) {
			setError(getErrorMessage(caughtError));
		}
	}, [database]);

	useEffect(() => {
		void getScreenData();
	}, [dataVersion, getScreenData]);

	const handleFetch = useCallback(async (): Promise<void> => {
		setIsFetching(true);
		setError("");
		setMessage("");
		try {
			const count = await fetchExchangeRates(database);
			setMessage(
				count
					? `Updated ${count} exchange rate${count === 1 ? "" : "s"}.`
					: "No foreign source currencies found.",
			);
			refreshData();
			await getScreenData();
		} catch (caughtError: unknown) {
			setError(getErrorMessage(caughtError));
		} finally {
			setIsFetching(false);
		}
	}, [database, getScreenData, refreshData]);

	const handleSave = useCallback(
		async (currencyCode: string): Promise<void> => {
			setError("");
			setMessage("");
			try {
				await saveManualExchangeRate(
					database,
					currencyCode,
					drafts[currencyCode] ?? "",
				);
				setMessage(`${currencyCode} rate saved.`);
				refreshData();
				await getScreenData();
			} catch (caughtError: unknown) {
				setError(getErrorMessage(caughtError));
			}
		},
		[database, drafts, getScreenData, refreshData],
	);

	const renderCurrency = useCallback(
		({ item: currencyCode }: { item: string }): React.JSX.Element => {
			const rate = rates.find(
				(existingRate) => existingRate.currencyCode === currencyCode,
			);
			return (
				<GlassCard>
					<View style={styles.rateHeader}>
						<View>
							<CustomText style={styles.currency}>
								1 {currencyCode}
							</CustomText>
							<CustomText style={styles.meta}>
								{rate
									? `${rate.source} · ${formatDateTime(rate.updatedAt)}`
									: "Rate not set"}
							</CustomText>
						</View>
						<CustomText style={styles.equals}>
							={" "}
							{rate
								? formatMoney(
										rate.rateToInr,
										DEFAULT_CURRENCY_CODE,
									)
								: `? ${DEFAULT_CURRENCY_CODE}`}
						</CustomText>
					</View>
					<TextField
						keyboardType="decimal-pad"
						label={`Rate to ${DEFAULT_CURRENCY_CODE}`}
						onChangeText={(value) =>
							setDrafts((currentDrafts) => ({
								...currentDrafts,
								[currencyCode]: value,
							}))
						}
						placeholder="0.00"
						value={drafts[currencyCode] ?? ""}
					/>
					<AppButton
						isCompact
						label="Save manual rate"
						onPress={() => void handleSave(currencyCode)}
						variant="secondary"
					/>
				</GlassCard>
			);
		},
		[drafts, handleSave, rates],
	);

	const listHeader = useMemo(
		() => (
			<ListHeader>
				<Notice message="Rates are master values used only for converted category and analysis totals. Transfers always use their stored from and to amounts." />
				<AppButton
					icon="cloud-download-outline"
					isLoading={isFetching}
					label="Fetch latest rates"
					onPress={() => void handleFetch()}
				/>
				{error ? <Notice message={error} tone="danger" /> : null}
				{message ? <Notice message={message} /> : null}
			</ListHeader>
		),
		[error, handleFetch, isFetching, message],
	);

	const listEmpty = useMemo(
		() => (
			<EmptyState
				icon="earth-outline"
				message="Add a source with a currency other than INR."
				title="No foreign currencies"
			/>
		),
		[],
	);

	return (
		<View style={styles.screen}>
			<ScreenList
				ListEmptyComponent={listEmpty}
				ListHeaderComponent={listHeader}
				data={currencies}
				extraData={[drafts, rates]}
				keyExtractor={(currencyCode) => currencyCode}
				renderItem={renderCurrency}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: COLORS.background,
	},
	rateHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 14,
	},
	currency: {
		color: COLORS.text,
		fontSize: 18,
		fontWeight: "900",
	},
	meta: {
		color: COLORS.textMuted,
		fontSize: 11,
		marginTop: 3,
	},
	equals: {
		color: COLORS.primaryBright,
		fontSize: 14,
		fontWeight: "800",
	},
});

export { ExchangeRatesScreen };
