import CustomInput from "../../components/CustomInput";
import Header from "../../components/Header";
import ScreenLayout from "../../components/ScreenLayout";
import useTrip from "./useTrip";

const TripAdd = () => {
	const { name, setName, handleClose, addTrip } = useTrip();

	return (
		<ScreenLayout>
			<Header
				handleClose={handleClose}
				canBeSubmitted={name !== ""}
				handleSubmit={addTrip}
			/>
			<CustomInput name={"Name"} value={name} setValue={setName} />
		</ScreenLayout>
	);
};

export default TripAdd;
