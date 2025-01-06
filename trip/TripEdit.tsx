import CustomButton from "../CustomButton";
import CustomInput from "../CustomInput";
import Header from "../Header";
import ScreenLayout from "../ScreenLayout";
import Vertical from "../Vertical";
import { MARGIN, QUARTER } from "../constants.config";
import useFocus from "../useFocus";
import useTrip from "./useTrip";

const TripEdit = ({ route }: any) => {
	const {
		name,
		setName,
		handleClose,
		disabled,
		updateTrip,
		handleEditFocus,
	} = useTrip(route.params.id);

	useFocus(handleEditFocus);

	return (
		<ScreenLayout>
			<Header handleClose={handleClose} />
			<Vertical size={MARGIN} />
			<CustomInput name={"Name"} value={name} setValue={setName} />
			<Vertical size={QUARTER} />
			<CustomButton disabled={disabled} onPress={updateTrip} />
		</ScreenLayout>
	);
};

export default TripEdit;
