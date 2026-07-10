import type financeConstants from "@/constants/financeConstants";

type VaultKind = (typeof financeConstants.VAULT_KINDS)[number];

export type { VaultKind as default };
