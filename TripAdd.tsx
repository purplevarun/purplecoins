import CustomButton from "./CustomButton";
import CustomInput from "./CustomInput";
import Header from "./Header";
import ScreenLayout from "./ScreenLayout";
import TripDatePicker from "./TripDatePicker";
import useTripService from "./TripService";
import useTripStore from "./TripStore";
import Vertical from "./Vertical";
import { FONT_SIZE } from "./constants.config";
import useNavigate from "./useNavigate";

const TripAdd = ({ route }: any) => {
	const tripId = route.params?.tripId ?? null;
	const { name, setName } = useTripStore();
	const { addNewTrip } = useTripService();
	const { navigateToTripMain } = useNavigate();
	return (
		<ScreenLayout>
			<Header title={"Add Trip"} handleClose={navigateToTripMain} />
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
