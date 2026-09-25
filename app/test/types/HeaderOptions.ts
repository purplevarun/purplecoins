import type { ReactElement } from "react";

type HeaderOptions<Props = unknown> = Readonly<{
	headerRight: () => ReactElement<Props>;
}>;

export type { HeaderOptions as default };
