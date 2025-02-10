import { useState } from "react";
import { investmentRoutes } from "../../app/router/Routes";
import CustomInput from "../../components/CustomInput";
import Header from "../../components/Header";
import ScreenLayout from "../../components/ScreenLayout";
import useDatabase from "../../hooks/useDatabase";
import useFocus from "../../hooks/useFocus";
import useScreen from "../../hooks/useScreen";

const InvestmentEdit = ({ route }: any) => {
	const id = route.params.id;
	const [name, setName] = useState("");
	const navigate = useScreen();
	const { fetchRelation, updateRelation } = useDatabase();
	useFocus(() => setName(fetchRelation(id).name));

	return (
		<ScreenLayout>
			<Header
				handleClose={() => navigate(investmentRoutes.main)}
				handleSubmit={() => {
					updateRelation(id, name);
					navigate(investmentRoutes.main);
				}}
				canBeSubmitted={name !== ""}
			/>
			<CustomInput name={"Source Name"} value={name} setValue={setName} />
		</ScreenLayout>
	);
};

export default InvestmentEdit;
