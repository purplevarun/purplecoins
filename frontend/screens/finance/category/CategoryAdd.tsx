import { CENTER, LARGE_FONT_SIZE } from "../../../config/constants.config";
import CategoryRoutes from "./CategoryRoutes";
import ScreenLayout from "../../../components/ScreenLayout";
import CustomText from "../../../components/CustomText";
import CustomInput from "../../../components/CustomInput";
import CustomButton from "../../../components/CustomButton";
import CloseButton from "../../../components/CloseButton";
import TypeSelector from "../transaction/TypeSelector";
import Vertical from "../../../components/Vertical";
import useCategoryStore from "./CategoryStore";
import useCategoryService from "./CategoryService";

const CategoryAdd = () => {
	const { categoryName, categoryType, setCategoryName, setCategoryType } = useCategoryStore();
	const { addNewCategory } = useCategoryService();

	return (
		<ScreenLayout>
			<CloseButton path={CategoryRoutes.Main} />
			<Vertical />
			<CustomText
				text={"Add Category"}
				alignSelf={CENTER}
				fontSize={LARGE_FONT_SIZE}
			/>
			<TypeSelector type={categoryType} setType={setCategoryType} />
			<CustomInput
				value={categoryName}
				setValue={setCategoryName}
				name={"Category Name"}
				required
			/>
			<CustomButton disabled={categoryName.length == 0} onPress={addNewCategory} />
		</ScreenLayout>
	);
};

export default CategoryAdd;
