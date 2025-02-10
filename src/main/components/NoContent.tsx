import { DISABLED_COLOR } from "../constants/colors.config";
import { CENTER, SCREEN_HEIGHT } from "../constants/constants.config";
import CustomText from "./CustomText";
import Header from "./Header";
import ScreenLayout from "./ScreenLayout";

const NoContent = ({
	handlePlus,
	text,
}: {
	handlePlus: () => void;
	text: string;
}) => {
	return (
		<ScreenLayout>
			<Header handlePlus={handlePlus} />
			<CustomText
				text={`No ${text} found`}
				alignSelf={CENTER}
				color={DISABLED_COLOR}
				paddingTop={SCREEN_HEIGHT / 3}
			/>
		</ScreenLayout>
	);
};

export default NoContent;
