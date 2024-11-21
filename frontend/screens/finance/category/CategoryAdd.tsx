import { useNavigation } from "@react-navigation/native";
import { CENTER, LARGE_FONT_SIZE } from "../../../config/constants.config";
import CategoryRoutes from "./CategoryRoutes";
import useStore from "../../../util/Zustand";
import ScreenLayout from "../../../components/ScreenLayout";
import CustomText from "../../../components/CustomText";
import CustomInput from "../../../components/CustomInput";
import CustomButton from "../../../components/CustomButton";
import CloseButton from "../../../components/CloseButton";
import TypeSelector from "../../../components/TypeSelector";
import useDatabase from "../../../util/database/DatabaseFunctions";
import Vertical from "../../../components/Vertical";
import ExpenseType from "../../../types/ExpenseType";

const CategoryAdd = () => {
	const { categoryName, categoryType, setCategoryName, setCategoryType } = useStore();
	const { navigate } = useNavigation<any>();
	const { createCategory } = useDatabase();

	const handlePress = () => {
		createCategory(categoryName, categoryType);
		setCategoryName("");
		setCategoryType(ExpenseType.EXPENSE);
		navigate(CategoryRoutes.Main);
	};

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
			<CustomButton disabled={categoryName.length == 0} onPress={handlePress} />
		</ScreenLayout>
	);
};

export default CategoryAdd;
