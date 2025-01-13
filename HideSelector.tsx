import { View } from "react-native";
import CustomText from "./CustomText";
import { DISABLED_COLOR } from "./colors.config";
import { FONT_SIZE, PADDING } from "./constants.config";

const HideSelector = ({
	destination = false,
	trip = false,
	category = false,
	investment = false,
}: {
	destination?: boolean;
	trip?: boolean;
	category?: boolean;
	investment?: boolean;
}) => {
	const text = category
		? "Categories"
		: trip
			? "Trips"
			: destination
				? "Destinations"
				: investment
					? "Investment"
					: "Sources";
	return (
		<View
			style={{
				paddingLeft: FONT_SIZE,
				paddingVertical: PADDING,
			}}
		>
			<CustomText text={`No ${text} available`} color={DISABLED_COLOR} />
		</View>
	);
};
export default HideSelector;
