import {
	GlassCard,
	IconDownload,
	IconUpload,
	Notice,
	Switch,
} from "@/components/ui";
import { useDb } from "@/hooks/useDatabase";
import { exportBackup, importBackup } from "@/services/backupService";
import {
	getNativeCurrencyDisplay,
	updateNativeCurrencyDisplay,
} from "@/services/settingsService";
import { getErrorMessage } from "@/utils/error";
import { useEffect, useState } from "react";

export const SettingsPage = () => {
	const { db, refreshData, setDb } = useDb();
	const [isNativeCurrency, setIsNativeCurrency] = useState(true);
	const [isWorking, setIsWorking] = useState(false);
	const [error, setError] = useState("");
	const [message, setMessage] = useState("");

	useEffect(() => {
		if (!db) return;
		void getNativeCurrencyDisplay(db).then(setIsNativeCurrency);
	}, [db]);

	const handleToggle = async (value: boolean) => {
		if (!db) return;
		setIsNativeCurrency(value);
		await updateNativeCurrencyDisplay(db, value);
		refreshData();
	};

	const handleExport = () => {
		try {
			exportBackup();
			setMessage("Backup downloaded.");
		} catch (e) {
			setError(getErrorMessage(e));
		}
	};

	const handleImport = async () => {
		setIsWorking(true);
		setError("");
		setMessage("");
		try {
			const newDb = await importBackup();
			setDb(newDb);
			setMessage("Backup restored successfully. All data reloaded.");
		} catch (e) {
			if ((e as Error).message !== "No file selected")
				setError(getErrorMessage(e));
		} finally {
			setIsWorking(false);
		}
	};

	return (
		<div
			style={{
				maxWidth: 480,
				display: "flex",
				flexDirection: "column",
				gap: 14,
			}}
		>
			<GlassCard>
				<div
					style={{ display: "flex", flexDirection: "column", gap: 6 }}
				>
					<div
						style={{
							fontSize: 22,
							fontWeight: 900,
							color: "var(--text)",
						}}
					>
						Purplecoins
					</div>
					<div
						style={{
							fontSize: 12,
							color: "var(--primary-bright)",
							fontWeight: 800,
						}}
					>
						Web Edition
					</div>
					<div
						style={{
							fontSize: 13,
							color: "var(--text-muted)",
							lineHeight: 1.5,
							marginTop: 4,
						}}
					>
						Local-first finance, tools and vault. Your data never
						leaves this browser.
					</div>
				</div>
			</GlassCard>

			<GlassCard>
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						gap: 14,
					}}
				>
					<div
						style={{
							fontSize: 16,
							fontWeight: 900,
							color: "var(--text)",
						}}
					>
						Currency display
					</div>
					<div className="switch-row">
						<div>
							<div
								style={{
									fontWeight: 700,
									color: "var(--text)",
									fontSize: 14,
								}}
							>
								Native currencies
							</div>
							<div
								style={{
									fontSize: 12,
									color: "var(--text-dim)",
									marginTop: 2,
									lineHeight: 1.5,
								}}
							>
								On: show totals per source currency. Off:
								convert to INR.
							</div>
						</div>
						<Switch
							checked={isNativeCurrency}
							onChange={(v) => void handleToggle(v)}
						/>
					</div>
				</div>
			</GlassCard>

			<GlassCard>
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						gap: 14,
					}}
				>
					<div
						style={{
							fontSize: 16,
							fontWeight: 900,
							color: "var(--text)",
						}}
					>
						Backup & restore
					</div>
					<div
						style={{
							fontSize: 13,
							color: "var(--text-muted)",
							lineHeight: 1.5,
						}}
					>
						A{" "}
						<code
							style={{
								color: "var(--primary-bright)",
								fontSize: 12,
							}}
						>
							.purplecoins
						</code>{" "}
						file is a raw SQLite database — fully compatible with
						the Android app.
					</div>
					<button
						className="btn btn-primary"
						onClick={handleExport}
						disabled={isWorking}
					>
						<IconDownload size={14} /> Export .purplecoins
					</button>
					<button
						className="btn btn-secondary"
						onClick={handleImport}
						disabled={isWorking}
					>
						<IconUpload size={14} />{" "}
						{isWorking ? "Restoring..." : "Restore .purplecoins"}
					</button>
				</div>
			</GlassCard>

			{message && <Notice message={message} tone="success" />}
			{error && <Notice message={error} tone="danger" />}
		</div>
	);
};
