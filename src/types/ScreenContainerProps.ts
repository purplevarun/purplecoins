import type { PropsWithChildren } from "react";

type ScreenContainerProps = PropsWithChildren<
	Readonly<{
		isScrollable?: boolean;
	}>
>;

export type { ScreenContainerProps as default };
