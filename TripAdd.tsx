import { FONT_SIZE } from "./constants.config";
import ScreenLayout from "./ScreenLayout";
import CustomInput from "./CustomInput";
import CustomButton from "./CustomButton";
import Vertical from "./Vertical";
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
