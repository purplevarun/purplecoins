import CustomInput from "../../../../CustomInput";
import Header from "../../../../Header";
import PaddedRow from "../../../../PaddedRow";
import ScreenLayout from "../../../../ScreenLayout";
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
