import {
	Field,
	GlassCard,
	IconPlus,
	IconRefresh,
	Notice,
	TextInput,
} from "@/components/ui";
import { useDb } from "@/hooks/useDatabase";
import {
	fetchExchangeRates,
	getExchangeRates,
	saveManualExchangeRate,
} from "@/services/exchangeRateService";
import type { ExchangeRate } from "@/types/ExchangeRate";
import { formatDate } from "@/utils/date";
import { getErrorMessage } from "@/utils/error";
import { useCallback, useEffect, useState } from "react";

export const ExchangeRatesPage = () => {
	const { db, dataVersion, refreshData } = useDb();
	const [rates, setRates] = useState<readonly ExchangeRate[]>([]);
	const [newCode, setNewCode] = useState("");
	const [newRate, setNewRate] = useState("");
	const [isFetching, setIsFetching] = useState(false);
	const [error, setError] = useState("");
	const [message, setMessage] = useState("");

	const load = useCallback(async () => {
		if (!db) return;
		try {
			setRates(await getExchangeRates(db));
		} catch (e) {
			setError(getErrorMessage(e));
		}
	}, [db]);

	useEffect(() => {
		void load();
	}, [dataVersion, load]);

	const handleAdd = async () => {
		if (!db || !newCode.trim() || !newRate.trim()) return;
		try {
			await saveManualExchangeRate(db, newCode, newRate);
			setNewCode("");
			setNewRate("");
			refreshData();
		} catch (e) {
			setError(getErrorMessage(e));
		}
	};

	const handleFetch = async () => {
		if (!db) return;
		setIsFetching(true);
		setError("");
		setMessage("");
		try {
			await fetchExchangeRates(db);
			refreshData();
			setMessage("Rates updated successfully.");
		} catch (e) {
			setError(getErrorMessage(e));
		} finally {
			setIsFetching(false);
		}
	};

	return (
		<div style={{ maxWidth: 560 }}>
			<div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
				<button
					className="btn btn-primary"
					onClick={handleFetch}
					disabled={isFetching}
				>
					<IconRefresh size={13} />{" "}
					{isFetching ? "Fetching..." : "Fetch latest rates"}
				</button>
			</div>

			{error && <Notice message={error} tone="danger" />}
			{message && <Notice message={message} tone="success" />}

			<GlassCard style={{ marginBottom: 14 }}>
				<div
					style={{ display: "flex", gap: 10, alignItems: "flex-end" }}
				>
					<Field label="Currency code">
						<TextInput
							value={newCode}
							onChange={setNewCode}
							placeholder="USD"
						/>
					</Field>
					<Field label="Rate to INR">
						<TextInput
							value={newRate}
							onChange={setNewRate}
							placeholder="83.5"
						/>
					</Field>
					<button
						className="btn btn-primary"
						style={{ flexShrink: 0, marginBottom: 0 }}
						onClick={handleAdd}
					>
						<IconPlus size={14} /> Add
					</button>
				</div>
			</GlassCard>

			<div className="list">
				{rates.map((r) => (
					<GlassCard key={r.currencyCode}>
						<div
							style={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
							}}
						>
							<div>
								<div
									style={{
										fontWeight: 800,
										color: "var(--text)",
									}}
								>
									{r.currencyCode}
								</div>
								<div
									style={{
										fontSize: 11,
										color: "var(--text-dim)",
										marginTop: 2,
									}}
								>
									Updated {formatDate(r.updatedAt)} ·{" "}
									{r.source}
								</div>
							</div>
							<div
								style={{
									fontWeight: 900,
									color: "var(--primary-bright)",
									fontSize: 15,
								}}
							>
								₹{r.rateToInr}
							</div>
						</div>
					</GlassCard>
				))}
			</div>
		</div>
	);
};
