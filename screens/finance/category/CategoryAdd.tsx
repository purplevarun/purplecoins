import { useNavigation } from "@react-navigation/native";
import { useQuery, useRealm } from "@realm/react";
import { useState } from "react";
import { generateUUID } from "../../../util/HelperFunctions";
import { CENTER, LARGE_FONT_SIZE } from "../../../config/constants.config";
import ScreenLayout from "../../../components/ScreenLayout";
import CustomText from "../../../components/CustomText";
import CustomInput from "../../../components/CustomInput";
import CustomButton from "../../../components/CustomButton";
import CloseButton from "../../../components/CloseButton";
import TypeSelector from "../../../components/TypeSelector";
import CategoryModel from "../../../models/CategoryModel";
import ExpenseType from "../../../types/ExpenseType";
import CategoryRoutes from "./CategoryRoutes";
import UserModel from "../../../models/UserModel";
import useTransactionStore from "../transaction/TransactionStore";

const CategoryAdd = () => {
	const realm = useRealm();
	const { navigate } = useNavigation<any>();
	const [name, setName] = useState("");
	const { type } = useTransactionStore();
	const userModels = useQuery(UserModel);

	const handlePress = () => {
		realm.write(() =>
			realm.create(CategoryModel, {
				id: generateUUID(),
				name,
				type,
				userId: userModels[0].id,
			}),
		);
		navigate(CategoryRoutes.Main);
	};

	return (
		<ScreenLayout>
			<CloseButton path={CategoryRoutes.Main} />
			<CustomText
				text="Add Category"
				alignSelf={CENTER}
				fontSize={LARGE_FONT_SIZE}
			/>
			<TypeSelector />
			<CustomInput value={name} setValue={setName} name="Category Name" />
			<CustomButton disabled={name.length == 0} onPress={handlePress} />
		</ScreenLayout>
	);
};

export default CategoryAdd;
