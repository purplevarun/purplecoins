import CustomButton from "../CustomButton";
import CustomInput from "../CustomInput";
import Header from "../Header";
import ScreenLayout from "../ScreenLayout";
import Vertical from "../Vertical";
import { MARGIN } from "../constants.config";
import useFocus from "../useFocus";
import useSource from "./useSource";

const SourceEdit = ({ route }: any) => {
	const { id } = route.params;
	const {
		name,
		setName,
		disabled,
		updateOneSource,
		fetchOneSource,
		handleClose,
	} = useSource();
	useFocus(() => {
		const source = fetchOneSource(id);
		setName(source.name);
	});
	return (
		<ScreenLayout>
			<Header handleClose={handleClose} />
			<Vertical size={MARGIN} />
			<CustomInput name={"Name"} value={name} setValue={setName} />
			<CustomButton
				disabled={disabled}
				onPress={() => updateOneSource(id)}
			/>
		</ScreenLayout>
	);
};

export default SourceEdit;
