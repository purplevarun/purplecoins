import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/AppButton";
import { EmptyState } from "@/components/EmptyState";
import { GlassCard } from "@/components/GlassCard";
import { Notice } from "@/components/Notice";
import { ScreenContainer } from "@/components/ScreenContainer";
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

	useFocusEffect(
		useCallback(() => {
			void dataVersion;
			void getScreenData();
		}, [dataVersion, getScreenData]),
	);

	const handleFetch = async (): Promise<void> => {
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
	};

	const handleSave = async (currencyCode: string): Promise<void> => {
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
	};

	return (
		<ScreenContainer>
			<Notice message="Rates are master values used only for converted category and analysis totals. Transfers always use their stored from and to amounts." />
			<AppButton
				icon="cloud-download-outline"
				isLoading={isFetching}
				label="Fetch latest rates"
				onPress={() => void handleFetch()}
			/>
			{error ? <Notice message={error} tone="danger" /> : null}
			{message ? <Notice message={message} /> : null}
			{currencies.length === 0 ? (
				<EmptyState
					icon="earth-outline"
					message="Add a source with a currency other than INR."
					title="No foreign currencies"
				/>
			) : null}
			{currencies.map((currencyCode) => {
				const rate = rates.find(
					(existingRate) =>
						existingRate.currencyCode === currencyCode,
				);
				return (
					<GlassCard key={currencyCode}>
						<View style={styles.rateHeader}>
							<View>
								<Text style={styles.currency}>
									1 {currencyCode}
								</Text>
								<Text style={styles.meta}>
									{rate
										? `${rate.source} · ${formatDateTime(rate.updatedAt)}`
										: "Rate not set"}
								</Text>
							</View>
							<Text style={styles.equals}>
								={" "}
								{rate
									? formatMoney(
											rate.rateToInr,
											DEFAULT_CURRENCY_CODE,
										)
									: `? ${DEFAULT_CURRENCY_CODE}`}
							</Text>
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
			})}
		</ScreenContainer>
	);
};

const styles = StyleSheet.create({
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
