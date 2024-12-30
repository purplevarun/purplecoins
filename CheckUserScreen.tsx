import { expo } from "./app.json";
import {
	CENTER,
	FONT_SIZE,
	LARGE_FONT_SIZE,
	MINIMUM_LENGTH,
} from "./constants.config";
import ScreenLayout from "./ScreenLayout";
import Vertical from "./Vertical";
import CustomText from "./CustomText";
import ErrorMessage from "./ErrorMessage";
import CustomInput from "./CustomInput";
import CustomButton from "./CustomButton";
import useAuthStore from "./useAuthStore";
import useAuthService from "./useAuthService";

const CheckUserScreen = () => {
	const { loading, error, username, setUsername } = useAuthStore();
	const { handleCheck } = useAuthService();

	return (
		<ScreenLayout loading={loading}>
			<Vertical size={40} />
			<CustomText
				text={`Welcome to ${expo.name}`}
				alignSelf={CENTER}
				fontSize={LARGE_FONT_SIZE}
			/>
			<ErrorMessage error={error} />
			<CustomInput
				name={"Username"}
				value={username}
				setValue={setUsername}
			/>
			<CustomButton
				onPress={handleCheck}
				disabled={username.length < MINIMUM_LENGTH}
				marginV={FONT_SIZE}
			/>
		</ScreenLayout>
	);
};

export default CheckUserScreen;
