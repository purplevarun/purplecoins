import type VoiceModule from "@react-native-voice/voice";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useState,
} from "react";
import { PermissionsAndroid, Platform, StyleSheet, View } from "react-native";

import EmptyState from "@/components/EmptyState";
import FloatingAddButton from "@/components/FloatingAddButton";
import HeaderIconButton from "@/components/HeaderIconButton";
import ListHeader from "@/components/ListHeader";
import Notice from "@/components/Notice";
import ScreenList from "@/components/ScreenList";
import SearchBar from "@/components/SearchBar";
import SegmentedControl from "@/components/SegmentedControl";
import TransactionCard from "@/components/TransactionCard";
import COLORS from "@/constants/colors";
import useDatabaseContext from "@/hooks/useDatabaseContext";
import transactionService from "@/services/transactionService";
import voiceQuickAddService from "@/services/voiceQuickAddService";
import type RootStackParamList from "@/types/RootStackParamList";
import type SelectOption from "@/types/SelectOption";
import type Transaction from "@/types/Transaction";
import dateUtils from "@/utils/date";
import getErrorMessage from "@/utils/error";
import moneyUtils from "@/utils/money";
import runAfterRender from "@/utils/runAfterRender";
const { getTransactionDisplayReason, getTransactions } = transactionService;
const { parseVoiceText } = voiceQuickAddService;
const { formatDate } = dateUtils;
const { formatMoney } = moneyUtils;

type TransactionsScreenProps = NativeStackScreenProps<
	RootStackParamList,
	"Transactions"
>;

const FILTER_OPTIONS: readonly SelectOption[] = [
	{ label: "All", value: "ALL" },
	{ label: "General", value: "GENERAL" },
	{ label: "Investment", value: "INVESTMENT" },
];

const TransactionsScreen = ({
	navigation,
}: TransactionsScreenProps): React.JSX.Element => {
	const { database, dataVersion } = useDatabaseContext();
	const [transactions, setTransactions] = useState<readonly Transaction[]>(
		[],
	);
	const [filter, setFilter] = useState("ALL");
	const [error, setError] = useState("");
	const [searchVisible, setSearchVisible] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [searchDebounced, setSearchDebounced] = useState("");
	const [isListening, setIsListening] = useState(false);
	const [voiceError, setVoiceError] = useState("");

	const getScreenData = useCallback(async (): Promise<void> => {
		try {
			setTransactions(await getTransactions(database));
			setError("");
		} catch (caughtError: unknown) {
			setError(getErrorMessage(caughtError));
		}
	}, [database]);

	useEffect(
		() =>
			runAfterRender(() => {
				void getScreenData();
			}),
		[dataVersion, getScreenData],
	);

	useEffect(() => {
		const timer = setTimeout(() => setSearchDebounced(searchQuery), 250);
		return () => clearTimeout(timer);
	}, [searchQuery]);

	useEffect(
		() => () => {
			const cleanupVoice = async (): Promise<void> => {
				try {
					const { default: Voice } =
						await import("@react-native-voice/voice");
					await Voice.destroy();
					Voice.removeAllListeners();
				} catch {
					// Ignore cleanup errors for optional native module.
				}
			};
			void cleanupVoice();
		},
		[],
	);

	useLayoutEffect(() => {
		navigation.setOptions({
			headerRight: () => (
				<HeaderIconButton
					accessibilityLabel={
						searchVisible ? "Close search" : "Search"
					}
					icon={searchVisible ? "close-outline" : "search-outline"}
					isActive={searchVisible}
					onPress={() => {
						setSearchVisible((v) => !v);
						setSearchQuery("");
						setSearchDebounced("");
					}}
				/>
			),
		});
	}, [navigation, searchVisible]);

	const filteredTransactions = useMemo(() => {
		let list = transactions;
		if (filter !== "ALL") {
			list = list.filter((t) => t.classification === filter);
		}
		if (searchDebounced.trim()) {
			const q = searchDebounced.trim().toLowerCase().replace(/,/g, "");
			list = list.filter((t) => {
				const amount = t.amount.replace(/,/g, "");
				return (
					getTransactionDisplayReason(t).toLowerCase().includes(q) ||
					t.sourceName.toLowerCase().includes(q) ||
					amount.includes(q) ||
					(t.categoryName ?? "").toLowerCase().includes(q) ||
					(t.tripName ?? "").toLowerCase().includes(q) ||
					(t.investmentName ?? "").toLowerCase().includes(q) ||
					formatDate(t.transactionAt).toLowerCase().includes(q) ||
					formatMoney(t.amount, t.sourceCurrencyCode)
						.replace(/,/g, "")
						.includes(q)
				);
			});
		}
		return list;
	}, [filter, transactions, searchDebounced]);

	const renderTransaction = useCallback(
		({ item: transaction }: { item: Transaction }): React.JSX.Element => (
			<TransactionCard
				transaction={transaction}
				onPress={() =>
					navigation.navigate("TransactionForm", {
						transactionId: transaction.id,
					})
				}
				onLongPress={() =>
					navigation.navigate("TransactionForm", {
						cloneFromTransactionId: transaction.id,
					})
				}
			/>
		),
		[navigation],
	);

	const handleVoiceAdd = useCallback(async (): Promise<void> => {
		setVoiceError("");

		if (Platform.OS !== "android" && Platform.OS !== "ios") {
			setVoiceError("Voice add is available only on Android and iOS.");
			return;
		}

		let Voice: typeof VoiceModule;
		try {
			({ default: Voice } = await import("@react-native-voice/voice"));
		} catch {
			setVoiceError("Voice add is unavailable in this build.");
			return;
		}

		if (isListening) {
			try {
				await Voice.stop();
			} catch {
				setVoiceError("Unable to stop listening. Try again.");
			}
			return;
		}

		if (Platform.OS === "android") {
			const permissionResult = await PermissionsAndroid.request(
				"android.permission.RECORD_AUDIO",
			);
			if (permissionResult !== PermissionsAndroid.RESULTS.GRANTED) {
				setVoiceError(
					"Microphone permission is required for voice quick-add.",
				);
				return;
			}
		}

		const isAvailable = Boolean(await Voice.isAvailable());
		if (!isAvailable) {
			setVoiceError(
				"Speech recognition is unavailable on this device right now.",
			);
			return;
		}

		setIsListening(true);
		let isResolved = false;
		let timeoutId: ReturnType<typeof setTimeout> | null = null;

		const teardown = async (): Promise<void> => {
			if (timeoutId) {
				clearTimeout(timeoutId);
				timeoutId = null;
			}
			setIsListening(false);
			try {
				await Voice.destroy();
			} catch {
				// Ignore teardown race conditions from the native module.
			}
			Voice.removeAllListeners();
		};

		const resolveWithText = async (
			spokenText: string | null,
			errorMessage?: string,
		): Promise<void> => {
			if (isResolved) {
				return;
			}
			isResolved = true;
			await teardown();

			if (errorMessage) {
				setVoiceError(errorMessage);
				return;
			}

			if (!spokenText) {
				setVoiceError("No speech detected. Try saying it again.");
				return;
			}

			const parsed = parseVoiceText(spokenText);
			navigation.navigate("TransactionForm", {
				prefillAmount: parsed.amount ?? undefined,
				prefillType: parsed.type ?? undefined,
				prefillReason: parsed.merchant ?? spokenText,
				prefillMerchant: parsed.merchant ?? undefined,
				prefillTransactionAt: Date.now(),
			});
		};

		Voice.onSpeechResults = (event) => {
			const spokenText =
				event.value
					?.map((value) => value.trim())
					.find((value) => value.length > 0) ?? null;
			void resolveWithText(spokenText);
		};
		Voice.onSpeechError = (event) => {
			const errorMessage = event.error?.message;
			void resolveWithText(
				null,
				errorMessage
					? `Voice add failed: ${errorMessage}`
					: "Voice add failed. Please try again.",
			);
		};
		Voice.onSpeechEnd = () => {
			if (!isResolved) {
				setTimeout(() => {
					void resolveWithText(null);
				}, 900);
			}
		};

		try {
			await Voice.start("en-IN");
		} catch {
			await teardown();
			setVoiceError("Unable to start voice recognition. Try again.");
			return;
		}
		timeoutId = setTimeout(() => {
			void resolveWithText(null);
		}, 12000);
	}, [isListening, navigation]);

	const listHeader = useMemo(
		() => (
			<ListHeader>
				<SegmentedControl
					onChange={setFilter}
					options={FILTER_OPTIONS}
					value={filter}
				/>
				{searchVisible ? (
					<SearchBar
						onChangeText={setSearchQuery}
						placeholder="Search transactions..."
						value={searchQuery}
					/>
				) : null}
				{isListening ? (
					<Notice message="Listening... Say something like: paid 450 to Swiggy" />
				) : null}
				{voiceError ? (
					<Notice message={voiceError} tone="danger" />
				) : null}
				{error ? <Notice message={error} tone="danger" /> : null}
			</ListHeader>
		),
		[error, filter, isListening, searchQuery, searchVisible, voiceError],
	);

	const listEmpty = useMemo(
		() => (
			<EmptyState
				icon="swap-horizontal-outline"
				message="Add a general or investment transaction."
				title="No transactions found"
			/>
		),
		[],
	);

	return (
		<View style={styles.screen}>
			<ScreenList
				ListEmptyComponent={listEmpty}
				ListHeaderComponent={listHeader}
				data={filteredTransactions}
				keyExtractor={(transaction) => transaction.id}
				renderItem={renderTransaction}
			/>
			<FloatingAddButton
				accessibilityLabel={
					isListening
						? "Stop voice quick-add"
						: "Start voice quick-add"
				}
				bottomOffset={96}
				icon={isListening ? "stop" : "mic-outline"}
				onPress={() => {
					void handleVoiceAdd();
				}}
				tone="secondary"
			/>
			<FloatingAddButton
				onPress={() => navigation.navigate("TransactionForm")}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: COLORS.background,
	},
});

export default TransactionsScreen;
