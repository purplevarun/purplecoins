import { useMemo } from "react";
import CustomText from "./CustomText";
import Header from "./Header";
import IServiceName from "./IServiceName";
import ScreenLayout from "./ScreenLayout";
import { DISABLED_COLOR } from "./colors.config";
import { CENTER, SCREEN_HEIGHT } from "./constants.config";
import useScreen from "./useScreen";

const NoContent = () => {
	const { serviceName } = useScreen();
	const text = useMemo(() => {
		if (serviceName === IServiceName.category) return `No Categories found`;
		else return `No ${serviceName}s found`;
	}, [serviceName]);
	return (
		<ScreenLayout>
			<Header />
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
