import { CustomText } from "@/components/CustomText";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

import { AppButton } from "@/components/AppButton";
import { AttachmentField } from "@/components/AttachmentField";
import { DateField } from "@/components/DateField";
import { GlassCard } from "@/components/GlassCard";
import { Notice } from "@/components/Notice";
import { ScreenContainer } from "@/components/ScreenContainer";
import { SegmentedControl } from "@/components/SegmentedControl";
import { SelectField } from "@/components/SelectField";
import { TextField } from "@/components/TextField";
import { COLORS } from "@/constants/colors";
import { useAppDialog } from "@/hooks/useAppDialog";
import { useAttachment } from "@/hooks/useAttachment";
import { useDatabaseContext } from "@/hooks/useDatabaseContext";
import { getCategories } from "@/services/categoryService";
import { getInvestments } from "@/services/investmentService";
import { getDefaultTripId } from "@/services/settingsService";
import { getSources } from "@/services/sourceService";
import {
	deleteTransaction,
	getTransaction,
	saveTransaction,
} from "@/services/transactionService";
import { getTrips } from "@/services/tripService";
import type { Category } from "@/types/Category";
import type { Investment } from "@/types/Investment";
import type { RootStackParamList } from "@/types/RootStackParamList";
import type { SelectOption } from "@/types/SelectOption";
import type { Source } from "@/types/Source";
import type { TransactionClassification } from "@/types/TransactionClassification";
import type { TransactionType } from "@/types/TransactionType";
import type { Trip } from "@/types/Trip";
import { getErrorMessage } from "@/utils/error";

type TransactionFormScreenProps = NativeStackScreenProps<
	RootStackParamList,
	"TransactionForm"
>;

const CLASSIFICATION_OPTIONS: readonly SelectOption[] = [
	{ label: "General", value: "GENERAL" },
	{ label: "Investment", value: "INVESTMENT" },
];
const GENERAL_TYPE_OPTIONS: readonly SelectOption[] = [
	{ label: "Debit", value: "DEBIT" },
	{ label: "Credit", value: "CREDIT" },
	{ label: "Transfer", value: "TRANSFER" },
];
const INVESTMENT_TYPE_OPTIONS: readonly SelectOption[] = [
	{ label: "Debit", value: "DEBIT" },
	{ label: "Credit", value: "CREDIT" },
];

const TransactionFormScreen = ({
	navigation,
	route,
}: TransactionFormScreenProps): React.JSX.Element => {
	const transactionId = route.params?.transactionId;
	const cloneFromTransactionId = route.params?.cloneFromTransactionId;
	const { database, refreshData } = useDatabaseContext();
	const dialog = useAppDialog();
	const attachment = useAttachment("TRANSACTION", transactionId);
	const [classification, setClassification] =
		useState<TransactionClassification>("GENERAL");
	const [type, setType] = useState<TransactionType>("DEBIT");
	const [sourceId, setSourceId] = useState("");
	const [destinationSourceId, setDestinationSourceId] = useState("");
	const [amount, setAmount] = useState("");
	const [toAmount, setToAmount] = useState("");
	const [categoryId, setCategoryId] = useState("");
	const [tripId, setTripId] = useState("");
	const [investmentId, setInvestmentId] = useState("");
	const [reason, setReason] = useState("");
	const [transactionAt, setTransactionAt] = useState(() => Date.now());
	const [sources, setSources] = useState<readonly Source[]>([]);
	const [categories, setCategories] = useState<readonly Category[]>([]);
	const [trips, setTrips] = useState<readonly Trip[]>([]);
	const [investments, setInvestments] = useState<readonly Investment[]>([]);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		const getFormData = async (): Promise<void> => {
			try {
				const sourceId = transactionId ?? cloneFromTransactionId;
				const [
					loadedSources,
					loadedCategories,
					loadedTrips,
					loadedInvestments,
					existingTransaction,
					defaultTrip,
				] = await Promise.all([
					getSources(database),
					getCategories(database),
					getTrips(database),
					getInvestments(database),
					sourceId
						? getTransaction(database, sourceId)
						: Promise.resolve(null),
					// Only load default trip for new (non-edit, non-clone) txns
					!sourceId
						? getDefaultTripId(database)
						: Promise.resolve(null),
				]);
				setSources(loadedSources);
				setCategories(loadedCategories);
				setTrips(loadedTrips);
				setInvestments(loadedInvestments);
				if (!existingTransaction) {
					// Prefill default trip for new transactions
					if (defaultTrip) {
						setTripId(defaultTrip);
					}
					return;
				}
				setClassification(existingTransaction.classification);
				setType(existingTransaction.type);
				setSourceId(existingTransaction.sourceId);
				setDestinationSourceId(
					existingTransaction.destinationSourceId ?? "",
				);
				setAmount(existingTransaction.amount);
				setToAmount(existingTransaction.toAmount ?? "");
				setCategoryId(existingTransaction.categoryId ?? "");
				setTripId(existingTransaction.tripId ?? "");
				setInvestmentId(existingTransaction.investmentId ?? "");
				setReason(existingTransaction.reason);
				// For clone mode: use today's date, not the original date
				if (!cloneFromTransactionId) {
					setTransactionAt(existingTransaction.transactionAt);
				}
			} catch (caughtError: unknown) {
				setError(getErrorMessage(caughtError));
			}
		};
		void getFormData();
	}, [database, transactionId, cloneFromTransactionId]);

	const selectedSource = sources.find((source) => source.id === sourceId);
	const selectedDestination = sources.find(
		(source) => source.id === destinationSourceId,
	);
	const isTransfer = classification === "GENERAL" && type === "TRANSFER";
	const isSameCurrencyTransfer =
		isTransfer &&
		selectedSource?.currencyCode === selectedDestination?.currencyCode;
	const effectiveToAmount = isSameCurrencyTransfer ? amount : toAmount;

	const sourceOptions: readonly SelectOption[] = sources.map((source) => ({
		label: source.name,
		value: source.id,
		description: `${source.currencyCode} · ${source.balance}`,
	}));
	const categoryOptions: readonly SelectOption[] = categories.map(
		(category) => ({
			label: category.name,
			value: category.id,
			description: category.isIncome ? "Income" : "Expense",
		}),
	);
	const tripOptions: readonly SelectOption[] = trips.map((trip) => ({
		label: trip.name,
		value: trip.id,
	}));
	const investmentOptions: readonly SelectOption[] = investments.map(
		(investment) => ({
			label: investment.name,
			value: investment.id,
		}),
	);

	const handleClassificationChange = (value: string): void => {
		const nextClassification =
			value === "INVESTMENT" ? "INVESTMENT" : "GENERAL";
		setClassification(nextClassification);
		if (nextClassification === "INVESTMENT" && type === "TRANSFER") {
			setType("DEBIT");
		}
	};

	const handleTypeChange = (value: string): void => {
		if (value === "CREDIT" || value === "TRANSFER") {
			setType(value);
			return;
		}
		setType("DEBIT");
	};

	const handleSave = async (): Promise<void> => {
		setIsSaving(true);
		setError("");
		try {
			const savedId = await saveTransaction(database, {
				id: transactionId,
				classification,
				type,
				sourceId,
				destinationSourceId:
					isTransfer && destinationSourceId
						? destinationSourceId
						: undefined,
				amount,
				toAmount:
					isTransfer && effectiveToAmount
						? effectiveToAmount
						: undefined,
				categoryId:
					classification === "GENERAL" &&
					type !== "TRANSFER" &&
					categoryId
						? categoryId
						: undefined,
				tripId:
					classification === "GENERAL" &&
					type !== "TRANSFER" &&
					tripId
						? tripId
						: undefined,
				investmentId:
					classification === "INVESTMENT" && investmentId
						? investmentId
						: undefined,
				reason,
				transactionAt,
			});
			await attachment.processAttachment(savedId);
			refreshData();
			navigation.goBack();
		} catch (caughtError: unknown) {
			setError(getErrorMessage(caughtError));
		} finally {
			setIsSaving(false);
		}
	};

	const handleDelete = (): void => {
		if (!transactionId) {
			return;
		}
		dialog.confirm({
			title: "Delete transaction?",
			message: "This action cannot be undone.",
			confirmLabel: "Delete",
			variant: "danger",
			onConfirm: () => {
				const processDelete = async (): Promise<void> => {
					try {
						await deleteTransaction(database, transactionId);
						refreshData();
						navigation.goBack();
					} catch (caughtError: unknown) {
						setError(getErrorMessage(caughtError));
					}
				};
				void processDelete();
			},
		});
	};

	return (
		<ScreenContainer>
			<GlassCard>
				<View style={styles.form}>
					<CustomText style={styles.heading}>
						{transactionId
							? "Edit transaction"
							: cloneFromTransactionId
								? "Clone transaction"
								: "New transaction"}
					</CustomText>
					<SegmentedControl
						onChange={handleClassificationChange}
						options={CLASSIFICATION_OPTIONS}
						value={classification}
					/>
					<SegmentedControl
						onChange={handleTypeChange}
						options={
							classification === "GENERAL"
								? GENERAL_TYPE_OPTIONS
								: INVESTMENT_TYPE_OPTIONS
						}
						value={type}
					/>
					<SelectField
						label={
							type === "CREDIT" ? "Destination source" : "Source"
						}
						onChange={setSourceId}
						options={sourceOptions}
						placeholder="Select source"
						value={sourceId}
					/>
					{isTransfer ? (
						<SelectField
							label="Destination source"
							onChange={setDestinationSourceId}
							options={sourceOptions.filter(
								(option) => option.value !== sourceId,
							)}
							placeholder="Select destination"
							value={destinationSourceId}
						/>
					) : null}
					<TextField
						keyboardType="decimal-pad"
						label={
							isTransfer && selectedSource
								? `From (${selectedSource.currencyCode})`
								: `Amount${selectedSource ? ` (${selectedSource.currencyCode})` : ""}`
						}
						onChangeText={setAmount}
						placeholder="0.00"
						value={amount}
					/>
					<DateField
						label="Date"
						onChange={setTransactionAt}
						value={transactionAt}
					/>
					{isTransfer ? (
						<TextField
							isEditable={!isSameCurrencyTransfer}
							keyboardType="decimal-pad"
							label={`To amount${selectedDestination ? ` (${selectedDestination.currencyCode})` : ""}`}
							onChangeText={setToAmount}
							placeholder="0.00"
							value={effectiveToAmount}
						/>
					) : null}
					{/* Category + Trip as individual rows */}
					{classification === "GENERAL" && type !== "TRANSFER" ? (
						<>
							<SelectField
								label="Category"
								onChange={setCategoryId}
								options={categoryOptions}
								placeholder="Select category"
								value={categoryId}
							/>
							<SelectField
								isOptional
								label="Trip"
								onChange={setTripId}
								options={tripOptions}
								placeholder="No trip"
								value={tripId}
							/>
						</>
					) : null}
					{classification === "INVESTMENT" ? (
						<SelectField
							label="Investment"
							onChange={setInvestmentId}
							options={investmentOptions}
							placeholder="Select investment"
							value={investmentId}
						/>
					) : null}
					<TextField
						label={isTransfer ? "Reason (optional)" : "Reason"}
						onChangeText={setReason}
						placeholder={
							isTransfer
								? "Defaults to Source A to Source B"
								: "What was this for?"
						}
						value={reason}
					/>
					<AttachmentField
						existingAttachment={attachment.existingAttachment}
						isRemoved={attachment.isRemoved}
						onOpen={() => void attachment.handleOpen()}
						onPick={() => void attachment.handlePick()}
						onRemove={attachment.handleRemove}
						pendingAttachment={attachment.pendingAttachment}
					/>
					{sources.length === 0 ? (
						<Notice
							message="Create a source before adding transactions."
							tone="warning"
						/>
					) : null}
					{error ? <Notice message={error} tone="danger" /> : null}
					<AppButton
						isDisabled={sources.length === 0}
						isLoading={isSaving}
						label="Save transaction"
						onPress={() => void handleSave()}
					/>
					{transactionId ? (
						<AppButton
							label="Delete transaction"
							onPress={handleDelete}
							variant="danger"
						/>
					) : null}
				</View>
			</GlassCard>
		</ScreenContainer>
	);
};

const styles = StyleSheet.create({
	form: {
		gap: 16,
	},
	heading: {
		color: COLORS.text,
		fontSize: 24,
		fontWeight: "900",
		letterSpacing: -0.5,
	},
});

export { TransactionFormScreen };
