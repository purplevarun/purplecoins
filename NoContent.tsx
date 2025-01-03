import ScreenLayout from "./ScreenLayout";
import NewHeader from "./NewHeader";
import { sourceRoutes } from "./Routes";
import CustomText from "./CustomText";
import { CENTER, SCREEN_HEIGHT } from "./constants.config";
import { DISABLED_COLOR } from "./colors.config";
import { useRoute } from "@react-navigation/native";

const NoContent = () => {
	const {name:screenName} = useRoute()
	const [name] = screenName.split(".");
	return (
		<ScreenLayout>
			<NewHeader screenName={sourceRoutes.main} />
			<CustomText
				text={`No ${name}s found`}
				alignSelf={CENTER}
				color={DISABLED_COLOR}
				paddingTop={SCREEN_HEIGHT / 3}
			/>
		</ScreenLayout>
	);
};

export default NoContent