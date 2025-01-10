import CustomButton from "../../../CustomButton";
import CustomInput from "../../../CustomInput";
import Header from "../../../Header";
import ScreenLayout from "../../../ScreenLayout";
import Vertical from "../../../Vertical";
import { MARGIN } from "../../../constants.config";
import useFocus from "../../../useFocus";
import useSource from "./useSource";

const SourceEdit = ({ route }: any) => {
	const {
		name,
		setName,
		disabled,
		updateOneSource,
		handleClose,
		handleEditFocus,
	} = useSource(route.params.id);
	useFocus(handleEditFocus);
	return (
		<ScreenLayout>
			<Header handleClose={handleClose} />
			<Vertical size={MARGIN} />
			<CustomInput name={"Name"} value={name} setValue={setName} />
			<CustomButton disabled={disabled} onPress={updateOneSource} />
		</ScreenLayout>
	);
};

export default SourceEdit;
