import { useMemo } from "react";
import { DISABLED_COLOR } from "../constants/colors.config";
import { CENTER, SCREEN_HEIGHT } from "../constants/constants.config";
import Service from "../constants/enums/Service";
import useScreen from "../hooks/useScreen";
import CustomText from "./CustomText";
import Header from "./Header";
import ScreenLayout from "./ScreenLayout";

const NoContent = ({ handlePlus }: { handlePlus: () => void }) => {
	const { serviceName } = useScreen();
	const text = useMemo(() => {
		if (serviceName === Service.CATEGORY) return `No Categories found`;
		else return `No ${serviceName}s found`;
	}, [serviceName]);
	return (
		<ScreenLayout>
			<Header handlePlus={handlePlus} />
			<CustomText
				text={text}
				alignSelf={CENTER}
				color={DISABLED_COLOR}
				paddingTop={SCREEN_HEIGHT / 3}
			/>
		</ScreenLayout>
	);
};

export default NoContent;
