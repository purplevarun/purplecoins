import ScreenLayout from "../../components/ScreenLayout";
import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";
import useCategoryStore from "./CategoryStore";
import useCategoryService from "./CategoryService";

const CategoryAdd = () => {
	const { name, setName } = useCategoryStore();
	const { addNewCategory } = useCategoryService();

	return (
		<ScreenLayout>
			<CustomInput
				value={name}
				setValue={setName}
				name={"Category Name"}
			/>
			<CustomButton
				disabled={name.length == 0}
				onPress={addNewCategory}
			/>
		</ScreenLayout>
	);
};

export default CategoryAdd;
