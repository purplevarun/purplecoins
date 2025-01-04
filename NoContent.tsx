import { useRoute } from "@react-navigation/native";
import { Header } from "react-native/Libraries/NewAppScreen";
import CustomText from "./CustomText";
import ScreenLayout from "./ScreenLayout";
import { DISABLED_COLOR } from "./colors.config";
import { CENTER, SCREEN_HEIGHT } from "./constants.config";

const NoContent = () => {
	const { name: screenName } = useRoute();
	const [name] = screenName.split(".");
	return (
		<ScreenLayout>
			<Header />
			<CustomText
				text={`No ${name}s found`}
				alignSelf={CENTER}
				color={DISABLED_COLOR}
				paddingTop={SCREEN_HEIGHT / 3}
			/>
		</ScreenLayout>
	);
};

export default NoContent;
