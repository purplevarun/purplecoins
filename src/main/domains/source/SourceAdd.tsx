import { sourceRoutes } from "../../app/router/Routes";
import CustomInput from "../../components/CustomInput";
import Header from "../../components/Header";
import ScreenLayout from "../../components/ScreenLayout";
import useDatabase from "../../hooks/useDatabase";
import useScreen from "../../hooks/useScreen";
import useValues from "../../hooks/useValues";

const SourceAdd = () => {
	const { sourceName, setSourceName } = useValues();
	const { navigate } = useScreen();
	const { addSource } = useDatabase();

	return (
		<ScreenLayout>
			<Header
				handleClose={() => navigate(sourceRoutes.main)}
				handleSubmit={addSource}
				canBeSubmitted={sourceName !== ""}
			/>
			<CustomInput
				name={"Source Name"}
				value={sourceName}
				setValue={setSourceName}
			/>
		</ScreenLayout>
	);
};

export default SourceAdd;
