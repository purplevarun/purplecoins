import CustomInput from "../../components/CustomInput";
import Header from "../../components/Header";
import ScreenLayout from "../../components/ScreenLayout";
import useFocus from "../../hooks/useFocus";
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
