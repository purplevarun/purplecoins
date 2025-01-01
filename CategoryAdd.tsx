import useCategoryService from "./CategoryService";
import useCategoryStore from "./CategoryStore";
import CustomButton from "./CustomButton";
import CustomInput from "./CustomInput";
import ScreenLayout from "./ScreenLayout";

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
