import CustomInput from "../../components/CustomInput";
import Header from "../../components/Header";
import PaddedRow from "../../components/PaddedRow";
import ScreenLayout from "../../components/ScreenLayout";
import useSource from "./useSource";

const SourceAdd = () => {
	const {
		name,
		setName,
		amount,
		setAmount,
		enabled,
		addSource,
		handleClose,
	} = useSource();

	return (
		<ScreenLayout>
			<Header
				handleClose={handleClose}
				handleSubmit={addSource}
				canBeSubmitted={enabled}
			/>
			<PaddedRow>
				<CustomInput
					name={"Name"}
					value={name}
					setValue={setName}
					width={"65%"}
				/>
				<CustomInput
					name={"Amount"}
					value={amount}
					setValue={setAmount}
					numeric
					width={"32%"}
				/>
			</PaddedRow>
		</ScreenLayout>
	);
};

export default SourceAdd;
