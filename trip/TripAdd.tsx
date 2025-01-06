import CustomButton from "../CustomButton";
import CustomInput from "../CustomInput";
import Header from "../Header";
import ScreenLayout from "../ScreenLayout";
import Vertical from "../Vertical";
import { MARGIN, QUARTER } from "../constants.config";
import useTrip from "./useTrip";

const TripAdd = () => {
	const { name, setName, handleClose, disabled, addTrip } = useTrip();

	return (
		<ScreenLayout>
			<Header handleClose={handleClose} />
			<Vertical size={MARGIN} />
			<CustomInput name={"Name"} value={name} setValue={setName} />
			<Vertical size={QUARTER} />
			<CustomButton disabled={disabled} onPress={addTrip} />
		</ScreenLayout>
	);
};

export default TripAdd;
