import CustomInput from "../../../../CustomInput";
import Header from "../../../../Header";
import ScreenLayout from "../../../../ScreenLayout";
import useFocus from "../../../../useFocus";
import useTrip from "./useTrip";

const TripEdit = ({ route }: any) => {
	const { name, setName, handleClose, updateTrip, handleEditFocus } = useTrip(
		route.params.id,
	);

	useFocus(handleEditFocus);

	return (
		<ScreenLayout>
			<Header
				handleClose={handleClose}
				handleSubmit={updateTrip}
				canBeSubmitted={name !== ""}
			/>
			<CustomInput name={"Name"} value={name} setValue={setName} />
		</ScreenLayout>
	);
};

export default TripEdit;
