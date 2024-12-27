import { expo } from "./app.json";
import {
	CENTER,
	FONT_SIZE,
	LARGE_FONT_SIZE,
	MINIMUM_LENGTH,
} from "./config/constants.config";
import useAuthService from "./useAuthService";
import ScreenLayout from "./components/ScreenLayout";
import Vertical from "./components/Vertical";
import CustomText from "./components/CustomText";
import ErrorMessage from "./ErrorMessage";
import CustomInput from "./components/CustomInput";
import CustomButton from "./components/CustomButton";
import useAuthStore from "./useAuthStore";

const CheckUserScreen = () => {
	const { username, error, loading, setUsername } = useAuthStore();
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
