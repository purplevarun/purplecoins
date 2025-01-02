import useCategoryService from "./CategoryService";
import useCategoryStore from "./CategoryStore";
import CustomButton from "./CustomButton";
import CustomInput from "./CustomInput";
import Header from "./Header";
import ScreenLayout from "./ScreenLayout";
import useNavigate from "./useNavigate";

const CategoryAdd = () => {
	const { name, setName } = useCategoryStore();
	const { addNewCategory } = useCategoryService();
	const { navigateToCategoryMain } = useNavigate();
	return (
		<ScreenLayout>
			<Header
				title={"Add Category"}
				navigateToMainScreen={navigateToCategoryMain}
			/>
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
