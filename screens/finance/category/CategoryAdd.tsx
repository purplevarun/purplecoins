import { useNavigation } from "@react-navigation/native";
import { useRealm } from "@realm/react";
import { useState } from "react";
import { LARGE_FONT_SIZE } from "../../../config/constants.config";
import uuid from "react-native-uuid";
import ScreenLayout from "../../../components/ScreenLayout";
import CustomText from "../../../components/CustomText";
import CustomInput from "../../../components/CustomInput";
import CustomButton from "../../../components/CustomButton";
import CloseButton from "../../../components/CloseButton";
import TypeSwitch from "../../../components/TypeSwitch";
import CategoryModel from "../../../models/CategoryModel";
import ExpenseType from "../../../types/ExpenseType";
import CategoryRoutes from "./CategoryRoutes";

const CategoryAdd = () => {
	const realm = useRealm();
	const { navigate } = useNavigation<any>();
	const [categoryName, setCategoryName] = useState("");
	const [switchValue, setSwitchValue] = useState(false);
	return (
		<ScreenLayout>
			<CloseButton path={CategoryRoutes.Main} />
			<CustomText
				text="Add Category"
				alignSelf="center"
				fontSize={LARGE_FONT_SIZE}
			/>
			<TypeSwitch value={switchValue} setValue={setSwitchValue} />
			<CustomInput
				value={categoryName}
				setValue={setCategoryName}
				name="Category Name"
			/>
			<CustomButton
				text={"Submit"}
				disabled={categoryName.length == 0}
				onPress={() => {
					realm.write(() => {
						realm.create(CategoryModel, {
							id: uuid.v4().toString(),
							name: categoryName,
							type: switchValue
								? ExpenseType.INCOME
								: ExpenseType.EXPENSE,
						});
					});
					navigate(CategoryRoutes.Main);
				}}
			/>
		</ScreenLayout>
	);
};

export default CategoryAdd;
