import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import {
	CENTER,
	LARGE_FONT_SIZE,
	PADDING
} from "../../../config/constants.config";
import TripRoutes from "./TripRoutes";
import ScreenLayout from "../../../components/ScreenLayout";
import CustomText from "../../../components/CustomText";
import CloseButton from "../../../components/CloseButton";
import CustomInput from "../../../components/CustomInput";
import CustomButton from "../../../components/CustomButton";
import Vertical from "../../../components/Vertical";
import TripDatePicker from "./TripDatePicker";
import useDatabase from "../../../util/database/DatabaseFunctions";
import useTripStore from "./TipStore";

const TripAdd = () => {
	const [name, setName] = useState("");
	const { navigate } = useNavigation<any>();
	const { createTrip } = useDatabase();
	const {
		tripStartDate,
		tripEndDate,
		tripStartDateSet,
		tripEndDateSet,
		setTripStartDateSet,
		setTripEndDateSet
	} = useTripStore();

	const handlePress = () => {
		createTrip(name, tripStartDateSet ? tripStartDate : null, tripEndDateSet ? tripEndDate : null);
		setName("");
		setTripStartDateSet(false);
		setTripEndDateSet(false);
		navigate(TripRoutes.Main);
	};

	return (
		<ScreenLayout>
			<CloseButton path={TripRoutes.Main} />
			<Vertical />
			<CustomText
				text={"Add Trip"}
				alignSelf={CENTER}
				fontSize={LARGE_FONT_SIZE}
			/>
			<Vertical size={PADDING / 2} />
			<CustomInput
				name={"Trip Name"}
				value={name}
				setValue={setName}
				required />
			<TripDatePicker />
			<CustomButton disabled={name.length == 0} onPress={handlePress} />
		</ScreenLayout>
	);
};

export default TripAdd;
