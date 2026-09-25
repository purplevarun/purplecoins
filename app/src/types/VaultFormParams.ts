import type VaultKind from "@/types/VaultKind";

type VaultFormParams = Readonly<{ kind: VaultKind; entryId?: string }>;

export type { VaultFormParams as default };
