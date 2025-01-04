import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { FC } from "react";
import { FONT_SIZE } from "./constants.config";

type ITabIcon = FC<{ color: string }>;
const tabIconSize = FONT_SIZE * 2;

export const BankIcon: ITabIcon = ({ color }) => {
	return <FontAwesome name={"bank"} size={tabIconSize} color={color} />;
};

export const TransactionIcon: ITabIcon = ({ color }) => {
	return (
		<FontAwesome6
			name={"money-bill-transfer"}
			size={tabIconSize}
			color={color}
		/>
	);
};

export const CategoryIcon: ITabIcon = ({ color }) => {
	return <FontAwesome6 name={"list"} size={tabIconSize} color={color} />;
};

export const TripIcon: ITabIcon = ({ color }) => {
	return <FontAwesome6 name={"plane-up"} size={tabIconSize} color={color} />;
};

export const InvestmentIcon: ITabIcon = ({ color }) => {
	return (
		<FontAwesome6 name={"chart-line"} size={tabIconSize} color={color} />
	);
};

export const SettingsIcon: ITabIcon = ({ color }) => {
	return <FontAwesome6 name={"gear"} size={tabIconSize} color={color} />;
};
