import { MARGIN, MINIMUM_LENGTH } from "./constants.config";
import ScreenLayout from "./ScreenLayout";
import CustomInput from "./CustomInput";
import CustomButton from "./CustomButton";
import useSourceStore from "./SourceStore";
import useSourceService from "./SourceService";
import Vertical from "./Vertical";

const SourceAdd = () => {
	const { name, setName, initialAmount, setInitialAmount } = useSourceStore();
	const { addNewSource } = useSourceService();

	return (
		<ScreenLayout>
			<Vertical size={MARGIN} />
			<CustomInput name={"Name"} value={name} setValue={setName} />
			<CustomInput
				name={"Initial Balance"}
				value={initialAmount}
				setValue={setInitialAmount}
				numeric
			/>
			<CustomButton
				disabled={name.length < MINIMUM_LENGTH}
				onPress={addNewSource}
			/>
		</ScreenLayout>
	);
};

export default SourceAdd;
