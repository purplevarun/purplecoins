import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { FC } from "react";
import { TouchableOpacity } from "react-native";
import { DISABLED_COLOR, PRIMARY_COLOR } from "./colors.config";
import { CENTER, FONT_SIZE, LARGE_FONT_SIZE } from "./constants.config";

type ITabIcon = FC<{ color: string }>;
const tabIconSize = FONT_SIZE * 2;

export const SourceIcon: ITabIcon = ({ color }) => (
	<FontAwesome
		name={"bank"}
		size={tabIconSize}
		color={color}
		testID={"source_icon"}
	/>
);

export const TransactionIcon: ITabIcon = ({ color }) => (
	<FontAwesome6
		name={"money-bill-transfer"}
		size={tabIconSize}
		color={color}
		testID={"transaction_icon"}
	/>
);

export const CategoryIcon: ITabIcon = ({ color }) => (
	<FontAwesome6
		name={"list"}
		size={tabIconSize}
		color={color}
		testID={"category_icon"}
	/>
);

export const TripIcon: ITabIcon = ({ color }) => (
	<FontAwesome6
		name={"plane-up"}
		size={tabIconSize}
		color={color}
		testID={"trip_icon"}
	/>
);

export const InvestmentIcon: ITabIcon = ({ color }) => (
	<FontAwesome6
		name={"chart-line"}
		size={tabIconSize}
		color={color}
		testID={"investment_icon"}
	/>
);

export const SettingsIcon: ITabIcon = ({ color }) => (
	<FontAwesome6
		name={"gear"}
		size={tabIconSize}
		color={color}
		testID={"setting_icon"}
	/>
);

export const EditIcon = ({ handleEdit }: { handleEdit?: () => void }) =>
	handleEdit && (
		<TouchableOpacity style={{ alignSelf: CENTER }} onPress={handleEdit}>
			<FontAwesome
				name="pencil-square"
				size={LARGE_FONT_SIZE * 1.5}
				color={PRIMARY_COLOR}
				testID={"edit_icon"}
			/>
		</TouchableOpacity>
	);

export const CheckIcon = ({
	handleCheck,
	enabled,
}: {
	handleCheck?: () => void;
	enabled?: boolean;
}) =>
	handleCheck && (
		<TouchableOpacity style={{ alignSelf: CENTER }} onPress={handleCheck}>
			<FontAwesome
				name="check"
				size={LARGE_FONT_SIZE * 1.6}
				color={enabled ? PRIMARY_COLOR : DISABLED_COLOR}
				testID={"check_icon"}
			/>
		</TouchableOpacity>
	);

export const PlusIcon = ({ handlePlus }: { handlePlus?: () => void }) =>
	handlePlus && (
		<TouchableOpacity style={{ alignSelf: CENTER }} onPress={handlePlus}>
			<FontAwesome
				name="plus"
				size={LARGE_FONT_SIZE * 1.6}
				color={PRIMARY_COLOR}
				testID={"plus_icon"}
			/>
		</TouchableOpacity>
	);

export const CloseIcon = ({ handleClose }: { handleClose?: () => void }) =>
	handleClose && (
		<TouchableOpacity
			style={{ alignSelf: CENTER, bottom: 1 }}
			onPress={handleClose}
		>
			<FontAwesome
				name="close"
				size={LARGE_FONT_SIZE * 1.6}
				color={PRIMARY_COLOR}
				testID={"close_icon"}
			/>
		</TouchableOpacity>
	);
