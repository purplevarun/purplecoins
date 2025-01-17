import CustomInput from "../../components/CustomInput";
import Header from "../../components/Header";
import ScreenLayout from "../../components/ScreenLayout";
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
