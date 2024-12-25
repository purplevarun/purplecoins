import { MARGIN, MINIMUM_LENGTH } from "../../config/constants.config";
import ScreenLayout from "../../components/ScreenLayout";
import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";
import useSourceStore from "./SourceStore";
import useSourceService from "./SourceService";
import Vertical from "../../components/Vertical";

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
