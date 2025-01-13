import { FC } from "react";

type ITabButton = FC<{
	active: boolean;
	navigate: (value: string) => void;
}>;

export default ITabButton;
