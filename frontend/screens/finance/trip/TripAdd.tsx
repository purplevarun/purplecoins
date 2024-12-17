import {
	CENTER,
	LARGE_FONT_SIZE,
	PADDING,
} from "../../../config/constants.config";
import ScreenLayout from "../../../components/ScreenLayout";
import CustomText from "../../../components/CustomText";
import CloseButton from "../../../components/CloseButton";
import CustomInput from "../../../components/CustomInput";
import CustomButton from "../../../components/CustomButton";
import Vertical from "../../../components/Vertical";
import TripDatePicker from "./TripDatePicker";
import useTripStore from "./TripStore";
import useTripService from "./TripService";

const TripAdd = () => {
	const { name, setName } = useTripStore();
	const { addNewTrip, clearStore, isEdit } = useTripService();
	return (
		<ScreenLayout>
			<CloseButton onPress={clearStore} />
			<Vertical />
			<CustomText
				text={isEdit() ? "Edit Trip" : "Add Trip"}
				alignSelf={CENTER}
				fontSize={LARGE_FONT_SIZE}
			/>
			<Vertical size={PADDING / 2} />
			<CustomInput name={"Trip Name"} value={name} setValue={setName} />
			<TripDatePicker />
			<CustomButton disabled={name.length == 0} onPress={addNewTrip} />
		</ScreenLayout>
	);
};

export default TripAdd;
