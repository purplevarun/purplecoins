import type CardEntry from "@/types/CardEntry";
import type IdentityEntry from "@/types/IdentityEntry";
import type PasswordEntry from "@/types/PasswordEntry";

type VaultListItem =
	| { kind: "PASSWORD"; entry: PasswordEntry }
	| { kind: "CARD"; entry: CardEntry }
	| { kind: "IDENTITY"; entry: IdentityEntry };

export type { VaultListItem as default };
