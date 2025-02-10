import { useState } from "react";
import { investmentRoutes } from "../../app/router/Routes";
import CustomInput from "../../components/CustomInput";
import Header from "../../components/Header";
import ScreenLayout from "../../components/ScreenLayout";
import RelationType from "../../constants/enums/RelationType";
import useDatabase from "../../hooks/useDatabase";
import useScreen from "../../hooks/useScreen";

const InvestmentAdd = () => {
	const [name, setName] = useState("");
	const navigate = useScreen();
	const { addRelation } = useDatabase();
	return (
		<ScreenLayout>
			<Header
				handleClose={() => navigate(investmentRoutes.main)}
				handleSubmit={() => {
					addRelation(name, RelationType.INVESTMENT);
					navigate(investmentRoutes.main);
				}}
				canBeSubmitted={name !== ""}
			/>
			<CustomInput
				name={"Investment Name"}
				value={name}
				setValue={setName}
			/>
		</ScreenLayout>
	);
};

export default InvestmentAdd;
