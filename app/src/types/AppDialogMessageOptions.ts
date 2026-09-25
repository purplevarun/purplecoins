import type ButtonVariant from "@/types/ButtonVariant";

type AppDialogMessageOptions = Readonly<{
	title: string;
	message: string;
	closeLabel?: string;
	variant?: ButtonVariant;
}>;

export type { AppDialogMessageOptions as default };
