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
import TypeSelector from "../../../components/TypeSelector";
import CategoryModel from "../../../models/CategoryModel";
import ExpenseType from "../../../types/ExpenseType";
import CategoryRoutes from "./CategoryRoutes";

const CategoryAdd = () => {
	const realm = useRealm();
	const { navigate } = useNavigation<any>();
	const [name, setName] = useState("");
	const [type, setType] = useState<ExpenseType>(ExpenseType.EXPENSE);
	return (
		<ScreenLayout>
			<CloseButton path={CategoryRoutes.Main} />
			<CustomText
				text="Add Category"
				alignSelf="center"
				fontSize={LARGE_FONT_SIZE}
			/>
			<TypeSelector value={type} setValue={setType} />
			<CustomInput value={name} setValue={setName} name="Category Name" />
			<CustomButton
				text={"Submit"}
				disabled={name.length == 0}
				onPress={() => {
					realm.write(() => {
						realm.create(CategoryModel, {
							id: uuid.v4().toString(),
							name,
							type,
						});
					});
					navigate(CategoryRoutes.Main);
				}}
			/>
		</ScreenLayout>
	);
};

export default CategoryAdd;
