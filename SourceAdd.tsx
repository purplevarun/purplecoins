import CustomButton from "./CustomButton";
import CustomInput from "./CustomInput";
import Header from "./Header";
import ScreenLayout from "./ScreenLayout";
import useSourceService from "./SourceService";
import useSourceStore from "./SourceStore";
import Vertical from "./Vertical";
import { MARGIN, MINIMUM_LENGTH } from "./constants.config";
import useNavigate from "./useNavigate";

const SourceAdd = () => {
	const { name, setName, initialAmount, setInitialAmount } = useSourceStore();
	const { addNewSource } = useSourceService();
	const { navigateToSourceMain } = useNavigate();
	return (
		<ScreenLayout>
			<Header
				title={"Add Source"}
				navigateToMainScreen={navigateToSourceMain}
			/>
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
