import CustomButton from "../CustomButton";
import CustomInput from "../CustomInput";
import Header from "../Header";
import ScreenLayout from "../ScreenLayout";
import Vertical from "../Vertical";
import { QUARTER } from "../constants.config";
import useSource from "./useSource";

const SourceAdd = () => {
	const {
		name,
		setName,
		amount,
		setAmount,
		disabled,
		addSource,
		handleClose,
	} = useSource();
	return (
		<ScreenLayout>
			<Header handleClose={handleClose} />
			<Vertical size={QUARTER} />
			<CustomInput name={"Name"} value={name} setValue={setName} />
			<Vertical size={QUARTER} />
			<CustomInput
				name={"Amount"}
				value={amount}
				setValue={setAmount}
				numeric
			/>
			<CustomButton disabled={disabled} onPress={addSource} />
		</ScreenLayout>
	);
};

export default SourceAdd;
