import CustomInput from "../../../../CustomInput";
import Header from "../../../../Header";
import ScreenLayout from "../../../../ScreenLayout";
import useCategory from "./useCategory";

const CategoryAdd = () => {
	const { handleClose, name, setName, addCategory } = useCategory();

	return (
		<ScreenLayout>
			<Header
				handleClose={handleClose}
				handleSubmit={addCategory}
				canBeSubmitted={name !== ""}
			/>
			<CustomInput name={"Name"} value={name} setValue={setName} />
		</ScreenLayout>
	);
};

export default CategoryAdd;
