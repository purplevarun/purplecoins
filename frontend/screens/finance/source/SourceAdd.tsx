import {
	CENTER,
	LARGE_FONT_SIZE,
	MARGIN,
	MINIMUM_LENGTH
} from "../../../config/constants.config";
import ScreenLayout from "../../../components/ScreenLayout";
import CloseButton from "../../../components/CloseButton";
import CustomText from "../../../components/CustomText";
import CustomInput from "../../../components/CustomInput";
import Vertical from "../../../components/Vertical";
import CustomButton from "../../../components/CustomButton";
import useSourceStore from "./SourceStore";
import useSourceService from "./SourceService";

const SourceAdd = () => {
	const {
		name,
		setName,
		initialAmount,
		setInitialAmount
	} = useSourceStore();
	const { addNewSource, clearStore } = useSourceService();

	return (
		<ScreenLayout>
			<CloseButton onPress={clearStore} />
			<Vertical />
			<CustomText
				text={"Add Source"}
				alignSelf={CENTER}
				fontSize={LARGE_FONT_SIZE}
			/>
			<Vertical size={MARGIN} />
			<CustomInput
				name={"Name"}
				value={name}
				setValue={setName}
				required
			/>
			<CustomInput
				name={"Initial Balance"}
				value={initialAmount}
				setValue={setInitialAmount}
				numeric
				required
			/>
			<CustomButton
				disabled={name.length < MINIMUM_LENGTH}
				onPress={addNewSource}
			/>
		</ScreenLayout>
	);
};

export default SourceAdd;
