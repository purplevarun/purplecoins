import CustomInput from "../../../../CustomInput";
import Header from "../../../../Header";
import ScreenLayout from "../../../../ScreenLayout";
import useFocus from "../../../../useFocus";
import useCategory from "./useCategory";

const CategoryEdit = ({ route }: any) => {
	const { name, setName, updateOneCategory, handleClose, handleEditFocus } =
		useCategory(route.params.id);
	useFocus(handleEditFocus);
	return (
		<ScreenLayout>
			<Header
				handleClose={handleClose}
				handleSubmit={updateOneCategory}
				canBeSubmitted={name !== ""}
			/>
			<CustomInput name={"Name"} value={name} setValue={setName} />
		</ScreenLayout>
	);
};
export default CategoryEdit;
