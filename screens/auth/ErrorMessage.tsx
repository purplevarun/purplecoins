import Center from "../../components/Center";
import CustomText from "../../components/CustomText";
import { RED_COLOR } from "../../config/colors.config";
import { CENTER, SMALL_FONT_SIZE } from "../../config/constants.config";
import Vertical from "../../components/Vertical";

const ErrorMessage = ({ error }: { error: string }) => {
	return error.length > 0 ? (
		<Center>
			<CustomText
				text={error}
				color={RED_COLOR}
				alignSelf={CENTER}
				fontSize={SMALL_FONT_SIZE}
			/>
		</Center>
	) : (
		<Vertical size={4} />
	);
};

export default ErrorMessage;
