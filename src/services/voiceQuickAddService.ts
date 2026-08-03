import type TransactionType from "@/types/TransactionType";

type VoiceParseResult = Readonly<{
	amount: string | null;
	type: TransactionType | null;
	merchant: string | null;
}>;

const DEBIT_KEYWORDS =
	/\b(paid|pay|paying|spent|spend|spending|bought|buy|buying|debit|send|sent|give|given)\b/i;
const CREDIT_KEYWORDS =
	/\b(received|receive|got|get|earned|earn|credit)\b/i;
const DEBIT_KEYWORDS_GLOBAL =
	/\b(paid|pay|paying|spent|spend|spending|bought|buy|buying|debit|send|sent|give|given)\b/gi;
const CREDIT_KEYWORDS_GLOBAL =
	/\b(received|receive|got|get|earned|earn|credit)\b/gi;
// Generic prepositions and filler words to remove when extracting the merchant.
const FILLER_WORDS =
	/\b(a|an|the|for|to|from|at|of|on|in|is|was|i|me|my|rupees?|inr|rs|and)\b/gi;
// Currency symbols that appear before or after numbers.
const CURRENCY_SYMBOLS = /[₹$€£¥]/g;

const extractAmount = (text: string): string | null => {
	const withoutCommas = text.replace(/,/g, "");
	const match = /\b(\d+(?:\.\d{1,2})?)\b/.exec(withoutCommas);
	return match?.[1] ?? null;
};

const inferType = (text: string): TransactionType | null => {
	if (CREDIT_KEYWORDS.test(text)) {
		return "CREDIT";
	}
	if (DEBIT_KEYWORDS.test(text)) {
		return "DEBIT";
	}
	return null;
};

const extractMerchant = (text: string): string | null => {
	const cleaned = text
		.replace(CURRENCY_SYMBOLS, " ")
		.replace(/\d+(?:,\d{3})*(?:\.\d{1,2})?/g, " ")
		.replace(DEBIT_KEYWORDS_GLOBAL, " ")
		.replace(CREDIT_KEYWORDS_GLOBAL, " ")
		.replace(FILLER_WORDS, " ")
		.replace(/[^a-zA-Z0-9&.\-' ]+/g, " ")
		.replace(/\s+/g, " ")
		.trim();
	// Require at least 2 characters so stray punctuation/letters don't count.
	return cleaned.length > 1 ? cleaned : null;
};

const parseVoiceText = (text: string): VoiceParseResult => ({
	amount: extractAmount(text),
	type: inferType(text),
	merchant: extractMerchant(text),
});

const voiceQuickAddService = { parseVoiceText };

export type { VoiceParseResult };
export default voiceQuickAddService;
