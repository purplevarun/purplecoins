import { generateUUID } from "../../../util/HelperFunctions";
import { useNavigation } from "@react-navigation/native";
import { useRealm } from "@realm/react";
import { useState } from "react";
import {
	CENTER,
	LARGE_FONT_SIZE,
	PADDING,
} from "../../../config/constants.config";
import TripRoutes from "./TripRoutes";
import ScreenLayout from "../../../components/ScreenLayout";
import CustomText from "../../../components/CustomText";
import CloseButton from "../../../components/CloseButton";
import CustomInput from "../../../components/CustomInput";
import CustomButton from "../../../components/CustomButton";
import Vertical from "../../../components/Vertical";
import TripDatePicker from "./TripDatePicker";
import useTripStore from "./TripStore";
import TripModel from "../../../models/TripModel";

const TripAdd = () => {
	const [name, setName] = useState("");
	const { navigate } = useNavigation<any>();
	const realm = useRealm();
	const { startDate, endDate, startDateSet, endDateSet } = useTripStore();

	const handlePress = () => {
		realm.write(() =>
			realm.create(TripModel, {
				id: generateUUID(),
				name,
				startDate: startDateSet ? startDate : null,
				endDate: endDateSet ? endDate : null,
			}),
		);
		navigate(TripRoutes.Main);
	};

	return (
		<ScreenLayout>
			<CloseButton path={TripRoutes.Main} />
			<CustomText
				text={"Add Trip"}
				alignSelf={CENTER}
				fontSize={LARGE_FONT_SIZE}
			/>
			<Vertical size={PADDING / 2} />
			<CustomInput value={name} setValue={setName} name={"Trip Name"} />
			<TripDatePicker />
			<CustomButton disabled={name.length == 0} onPress={handlePress} />
		</ScreenLayout>
	);
};

export default TripAdd;
