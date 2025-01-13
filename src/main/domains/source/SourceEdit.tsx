import CustomInput from "../../../../CustomInput";
import Header from "../../../../Header";
import ScreenLayout from "../../../../ScreenLayout";
import useFocus from "../../../../useFocus";
import useSource from "./useSource";

const SourceEdit = ({ route }: any) => {
	const {
		name,
		setName,
		enabled,
		updateOneSource,
		handleClose,
		handleEditFocus,
	} = useSource(route.params.id);
	useFocus(handleEditFocus);
	return (
		<ScreenLayout>
			<Header
				handleClose={handleClose}
				handleSubmit={updateOneSource}
				canBeSubmitted={enabled}
			/>
			<CustomInput name={"Name"} value={name} setValue={setName} />
		</ScreenLayout>
	);
};

export default SourceEdit;
