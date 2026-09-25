import CustomText from "@/components/CustomText";

import { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";

import AppButton from "@/components/AppButton";
import AttachmentField from "@/components/AttachmentField";
import DateField from "@/components/DateField";
import GlassCard from "@/components/GlassCard";
import HeaderIconButton from "@/components/HeaderIconButton";
import Notice from "@/components/Notice";
import ScreenContainer from "@/components/ScreenContainer";
import SegmentedControl from "@/components/SegmentedControl";
import SelectField from "@/components/SelectField";
import TextField from "@/components/TextField";
import COLORS from "@/constants/colors";
import financeConstants from "@/constants/financeConstants";
import useAppDialog from "@/hooks/useAppDialog";
import useAttachment from "@/hooks/useAttachment";
import useDatabaseContext from "@/hooks/useDatabaseContext";
import categoryService from "@/services/categoryService";
import investmentService from "@/services/investmentService";
import settingsService from "@/services/settingsService";
import sourceService from "@/services/sourceService";
import transactionService from "@/services/transactionService";
import tripService from "@/services/tripService";
import type Category from "@/types/Category";
import type Investment from "@/types/Investment";
import type SelectOption from "@/types/SelectOption";
import type Source from "@/types/Source";
import type TransactionClassification from "@/types/TransactionClassification";
import type TransactionFormScreenProps from "@/types/TransactionFormScreenProps";
import type TransactionItemDraft from "@/types/TransactionItemDraft";
import type TransactionItemInput from "@/types/TransactionItemInput";
import type TransactionType from "@/types/TransactionType";
import type Trip from "@/types/Trip";
import getErrorMessage from "@/utils/error";
import createId from "@/utils/id";
import moneyUtils from "@/utils/money";
const { normalizeMoney, sumMoney, formatMoney } = moneyUtils;
const { getCategories } = categoryService;
const { getInvestments } = investmentService;
const { getDefaultSourceId, getDefaultTripId } = settingsService;
const { getSources } = sourceService;
const { deleteTransaction, getTransaction, saveTransaction } =
	transactionService;
const { getTrips } = tripService;

const {
	DEFAULT_TRANSACTION_CLASSIFICATION,
	DEFAULT_TRANSACTION_TYPE,
	GENERAL_TRANSACTION_TYPE_OPTIONS,
	INVESTMENT_TRANSACTION_TYPE_OPTIONS,
	TRANSACTION_CLASSIFICATION_OPTIONS,
} = financeConstants;

const createItemDraft = (
	amount = "",
	categoryId = "",
): TransactionItemDraft => ({ key: createId(), amount, categoryId });

const TransactionFormScreen = ({
	navigation,
	route,
}: TransactionFormScreenProps): React.JSX.Element => {
	const transactionId = route.params?.transactionId;
	const cloneFromTransactionId = route.params?.cloneFromTransactionId;
	const initialSourceId = route.params?.initialSourceId;
	const initialCategoryId = route.params?.initialCategoryId;
	const { database, refreshData } = useDatabaseContext();
	const dialog = useAppDialog();
	const attachment = useAttachment("TRANSACTION", transactionId);
	const [classification, setClassification] =
		useState<TransactionClassification>(DEFAULT_TRANSACTION_CLASSIFICATION);
	const [type, setType] = useState<TransactionType>(DEFAULT_TRANSACTION_TYPE);
	const [sourceId, setSourceId] = useState("");
	const [destinationSourceId, setDestinationSourceId] = useState("");
	const [amount, setAmount] = useState("");
	const [toAmount, setToAmount] = useState("");
	const [categoryId, setCategoryId] = useState("");
	const [tripId, setTripId] = useState("");
	const [investmentId, setInvestmentId] = useState("");
	const [reason, setReason] = useState("");
	const [transactionAt, setTransactionAt] = useState(
		() => route.params?.initialTransactionAt ?? Date.now(),
	);
	const [sources, setSources] = useState<readonly Source[]>([]);
	const [categories, setCategories] = useState<readonly Category[]>([]);
	const [trips, setTrips] = useState<readonly Trip[]>([]);
	const [investments, setInvestments] = useState<readonly Investment[]>([]);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState("");
	const [items, setItems] = useState<readonly TransactionItemDraft[]>(() => [
		createItemDraft("", initialCategoryId ?? ""),
	]);
	const saving = useRef(false);

	useEffect(() => {
		const getFormData = async (): Promise<void> => {
			try {
				const lookupTransactionId =
					transactionId ?? cloneFromTransactionId;
				const [
					loadedSources,
					loadedCategories,
					loadedTrips,
					loadedInvestments,
					existingTransaction,
					defaultTrip,
					defaultSource,
				] = await Promise.all([
					getSources(database),
					getCategories(database),
					getTrips(database),
					getInvestments(database),
					lookupTransactionId
						? getTransaction(database, lookupTransactionId)
						: Promise.resolve(null),
					// Only load default trip for new (non-edit, non-clone) txns
					!lookupTransactionId
						? getDefaultTripId(database)
						: Promise.resolve(null),
					!lookupTransactionId
						? getDefaultSourceId(database)
						: Promise.resolve(null),
				]);
				setSources(loadedSources);
				setCategories(loadedCategories);
				setTrips(loadedTrips);
				setInvestments(loadedInvestments);
				if (!existingTransaction) {
					if (!lookupTransactionId) {
						setSourceId(
							initialSourceId ??
								loadedSources.find(
									(source) => source.id === defaultSource,
								)?.id ??
								"",
						);
						setCategoryId(initialCategoryId ?? "");
					}
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
				if (
					existingTransaction.classification === "GENERAL" &&
					existingTransaction.type === "DEBIT"
				) {
					setItems(
						existingTransaction.items.map((item) => ({
							key: createId(),
							id: cloneFromTransactionId ? undefined : item.id,
							amount: item.amount,
							categoryId: item.categoryId,
							categoryName: item.categoryName,
						})),
					);
				}
				// For clone mode: use today's date, not the original date
				if (!cloneFromTransactionId) {
					setTransactionAt(existingTransaction.transactionAt);
				}
			} catch (caughtError: unknown) {
				setError(getErrorMessage(caughtError));
			}
		};
		void getFormData();
	}, [
		database,
		transactionId,
		cloneFromTransactionId,
		initialSourceId,
		initialCategoryId,
	]);

	const selectedSource = sources.find((source) => source.id === sourceId);
	const selectedDestination = sources.find(
		(source) => source.id === destinationSourceId,
	);
	const isTransfer = classification === "GENERAL" && type === "TRANSFER";
	const isExpense = classification === "GENERAL" && type === "DEBIT";
	const isSameCurrencyTransfer =
		isTransfer &&
		selectedSource?.currencyCode === selectedDestination?.currencyCode;
	const effectiveToAmount = isSameCurrencyTransfer ? amount : toAmount;
	let expenseTotal: string | null;
	try {
		expenseTotal = sumMoney(
			items.map((item) => normalizeMoney(item.amount)),
		);
	} catch {
		expenseTotal = null;
	}

	const updateItem = (
		key: string,
		changes: Partial<TransactionItemInput>,
	): void => {
		setItems((current) =>
			current.map((item) =>
				item.key === key ? { ...item, ...changes } : item,
			),
		);
	};

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

	const changeMode = (
		nextClassification: TransactionClassification,
		nextType: TransactionType,
	): void => {
		const nextIsExpense =
			nextClassification === "GENERAL" && nextType === "DEBIT";
		const applyChange = (): void => {
			if (isExpense && !nextIsExpense) {
				setAmount(expenseTotal ?? "");
				setCategoryId(items[0]?.categoryId ?? "");
				setItems([createItemDraft()]);
			} else if (!isExpense && nextIsExpense) {
				setItems([createItemDraft(amount, categoryId)]);
			}
			setClassification(nextClassification);
			setType(nextType);
		};
		if (isExpense && !nextIsExpense && items.length > 1) {
			dialog.confirm({
				title: "Remove item breakdown?",
				message:
					"Keep the total as one amount and remove the individual expense items?",
				confirmLabel: "Continue",
				onConfirm: applyChange,
			});
		} else {
			applyChange();
		}
	};

	const handleClassificationChange = (value: string): void => {
		const nextClassification =
			value === "INVESTMENT" ? "INVESTMENT" : "GENERAL";
		changeMode(
			nextClassification,
			nextClassification === "INVESTMENT" && type === "TRANSFER"
				? "DEBIT"
				: type,
		);
	};

	const handleTypeChange = (value: string): void => {
		changeMode(
			classification,
			value === "CREDIT" || value === "TRANSFER" ? value : "DEBIT",
		);
	};

	const handleSave = async (): Promise<void> => {
		if (saving.current) return;
		saving.current = true;
		setIsSaving(true);
		setError("");
		try {
			await saveTransaction(
				database,
				{
					id: transactionId,
					classification,
					type,
					sourceId,
					destinationSourceId:
						isTransfer && destinationSourceId
							? destinationSourceId
							: undefined,
					amount: isExpense ? (expenseTotal ?? "0") : amount,
					items: isExpense
						? items.map((item) => ({
								id: item.id,
								amount: item.amount,
								categoryId: item.categoryId,
							}))
						: undefined,
					toAmount:
						isTransfer && effectiveToAmount
							? effectiveToAmount
							: undefined,
					categoryId:
						classification === "GENERAL" &&
						type === "CREDIT" &&
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
				},
				attachment.pendingAttachment ??
					(attachment.isRemoved ? null : undefined),
			);
			refreshData();
			navigation.goBack();
		} catch (caughtError: unknown) {
			setError(getErrorMessage(caughtError));
		} finally {
			saving.current = false;
			setIsSaving(false);
		}
	};

	const handleDelete = (targetTransactionId: string): void => {
		dialog.confirm({
			title: "Delete transaction?",
			message: "This action cannot be undone.",
			confirmLabel: "Delete",
			variant: "danger",
			onConfirm: () => {
				const processDelete = async (): Promise<void> => {
					try {
						await deleteTransaction(database, targetTransactionId);
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
				<View
					style={styles.form}
					pointerEvents={isSaving ? "none" : "auto"}
				>
					<CustomText style={styles.heading}>
						{transactionId
							? "Edit transaction"
							: cloneFromTransactionId
								? "Clone transaction"
								: "New transaction"}
					</CustomText>
					<SegmentedControl
						onChange={handleClassificationChange}
						options={TRANSACTION_CLASSIFICATION_OPTIONS}
						value={classification}
					/>
					<SegmentedControl
						onChange={handleTypeChange}
						options={
							classification === "GENERAL"
								? GENERAL_TRANSACTION_TYPE_OPTIONS
								: INVESTMENT_TRANSACTION_TYPE_OPTIONS
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
					{!isExpense ? (
						<TextField
							isEditable={!isSaving}
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
					) : null}
					<DateField
						label="Date"
						onChange={setTransactionAt}
						value={transactionAt}
					/>
					{isExpense ? (
						<View style={styles.items}>
							{items.map((item, position) => (
								<View key={item.key} style={styles.item}>
									<View style={styles.itemHeading}>
										<CustomText
											style={styles.itemTitle}
										>{`Item ${position + 1}`}</CustomText>
										{items.length > 1 ? (
											<HeaderIconButton
												icon="close-outline"
												accessibilityLabel={`Remove item ${position + 1}`}
												onPress={() =>
													setItems((current) =>
														current.filter(
															(candidate) =>
																candidate.key !==
																item.key,
														),
													)
												}
											/>
										) : null}
									</View>
									<TextField
										isEditable={!isSaving}
										keyboardType="decimal-pad"
										label={`Amount${selectedSource ? ` (${selectedSource.currencyCode})` : ""}`}
										placeholder="0.00"
										value={item.amount}
										onChangeText={(value) =>
											updateItem(item.key, {
												amount: value,
											})
										}
									/>
									<SelectField
										label="Category"
										placeholder="Select category"
										value={item.categoryId}
										onChange={(value) =>
											updateItem(item.key, {
												categoryId: value,
											})
										}
										options={
											item.categoryId &&
											!categoryOptions.some(
												(option) =>
													option.value ===
													item.categoryId,
											)
												? [
														{
															value: item.categoryId,
															label:
																item.categoryName ??
																"Category",
														},
														...categoryOptions,
													]
												: categoryOptions
										}
									/>
								</View>
							))}
							<AppButton
								label="Add item"
								icon="add"
								variant="secondary"
								isDisabled={isSaving}
								onPress={() =>
									setItems((current) => [
										...current,
										createItemDraft(),
									])
								}
							/>
							{items.length > 1 ? (
								<View style={styles.totalRow}>
									<CustomText style={styles.itemTitle}>
										Total
									</CustomText>
									<CustomText style={styles.totalAmount}>
										{expenseTotal === null
											? "--"
											: selectedSource
												? formatMoney(
														expenseTotal,
														selectedSource.currencyCode,
													)
												: expenseTotal}
									</CustomText>
								</View>
							) : null}
						</View>
					) : null}
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
					{classification === "GENERAL" && type !== "TRANSFER" ? (
						<>
							{!isExpense ? (
								<SelectField
									label="Category"
									onChange={setCategoryId}
									options={categoryOptions}
									placeholder="Select category"
									value={categoryId}
								/>
							) : null}
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
						isEditable={!isSaving}
						label="Reason (optional)"
						onChangeText={setReason}
						placeholder={
							isTransfer
								? "Defaults to Source A to Source B"
								: isExpense && items.length > 1
									? "Defaults to the item categories"
									: "Defaults to the selected category"
						}
						value={reason}
					/>
					<AttachmentField
						existingAttachment={attachment.existingAttachment}
						isRemoved={attachment.isRemoved}
						onOpen={async () => {
							const uri = await attachment.handleOpen();
							if (uri) {
								// Try to preview images/PDFs in-app using Linking or a preview component.
								// For now, fall back to sharing if available.
								const Sharing = await import("expo-sharing");
								if (await Sharing.isAvailableAsync()) {
									await Sharing.shareAsync(uri, {
										dialogTitle:
											attachment.existingAttachment
												?.fileName,
									});
								}
							}
						}}
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
							onPress={() => handleDelete(transactionId)}
							variant="danger"
						/>
					) : null}
				</View>
			</GlassCard>
		</ScreenContainer>
	);
};

const styles = StyleSheet.create({
	items: { gap: 16 },
	item: { gap: 12 },
	itemHeading: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		minHeight: 44,
	},
	itemTitle: { color: COLORS.text, fontSize: 15, fontWeight: "700" },
	totalRow: {
		flexDirection: "row",
		flexWrap: "wrap",
		alignItems: "center",
		justifyContent: "space-between",
		gap: 12,
	},
	totalAmount: {
		color: COLORS.text,
		fontSize: 18,
		fontWeight: "700",
		flexShrink: 1,
	},
	form: {
		gap: 16,
	},
	heading: {
		color: COLORS.text,
		fontSize: 24,
		fontWeight: "900",
		letterSpacing: 0,
	},
});

export default TransactionFormScreen;
