import { CENTER, LARGE_FONT_SIZE } from "../../../config/constants.config";
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
	const { name, type, setName, setType } = useCategoryStore();
	const { addNewCategory } = useCategoryService();

	return (
		<ScreenLayout>
			<CloseButton />
			<Vertical />
			<CustomText
				text={"Add Category"}
				alignSelf={CENTER}
				fontSize={LARGE_FONT_SIZE}
			/>
			<TypeSelector type={type} setType={setType} />
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
