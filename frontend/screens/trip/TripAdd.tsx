import { FONT_SIZE } from "../../config/constants.config";
import ScreenLayout from "../../components/ScreenLayout";
import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";
import Vertical from "../../components/Vertical";
import TripDatePicker from "./TripDatePicker";
import useTripStore from "./TripStore";
import useTripService from "./TripService";

const TripAdd = ({ route }: any) => {
	const tripId = route.params?.tripId ?? null;
	const { name, setName } = useTripStore();
	const { addNewTrip } = useTripService();
	return (
		<ScreenLayout>
			<Vertical size={FONT_SIZE / 2} />
			<CustomInput name={"Trip Name"} value={name} setValue={setName} />
			<TripDatePicker />
			<CustomButton
				disabled={name.length == 0}
				onPress={() => addNewTrip(tripId)}
			/>
		</ScreenLayout>
	);
};

export default TripAdd;
