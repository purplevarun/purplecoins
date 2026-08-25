import type { PropsWithChildren } from "react";

type GlassCardProps = PropsWithChildren<
	Readonly<{
		accent?: "default" | "success" | "danger" | "warning";
	}>
>;

export type { GlassCardProps as default };
