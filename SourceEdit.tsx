import CustomButton from "./CustomButton";
import CustomInput from "./CustomInput";
import Header from "./Header";
import ScreenLayout from "./ScreenLayout";
import useSourceService from "./SourceService";
import useSourceStore from "./SourceStore";
import Vertical from "./Vertical";
import { MARGIN } from "./constants.config";
import useFocus from "./useFocus";
import useNavigate from "./useNavigate";

const SourceEdit = ({ route }: any) => {
	const { sourceId } = route.params;
	const { name, setName, initialAmount, setInitialAmount } = useSourceStore();
	const {  fetchSource, updateSource } = useSourceService();
	const { navigateToSourceMain } = useNavigate();
	const source = fetchSource(sourceId);
	useFocus(() => {
		setName(source.name);
		setInitialAmount(source.initialAmount.toString());
	});
	return (
		<ScreenLayout>
			<Header
				title={"Edit Source"}
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
				disabled={name.length <= 1}
				onPress={() => {
					updateSource(sourceId);
				}}
			/>
		</ScreenLayout>
	);
};

export default SourceEdit;
