import CustomInput from "../../components/CustomInput";
import Header from "../../components/Header";
import ScreenLayout from "../../components/ScreenLayout";
import useFocus from "../../hooks/useFocus";
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
