import { sourceRoutes } from "../../app/router/Routes";
import CustomInput from "../../components/CustomInput";
import Header from "../../components/Header";
import ScreenLayout from "../../components/ScreenLayout";
import useDatabase from "../../hooks/useDatabase";
import useFocus from "../../hooks/useFocus";
import useScreen from "../../hooks/useScreen";
import useValues from "../../hooks/useValues";

const SourceEdit = ({ route }: any) => {
	const id = route.params.id;
	const { sourceName, setSourceName } = useValues();
	const { navigate } = useScreen();
	const { fetchSource, updateSource } = useDatabase();

	useFocus(() => {
		const source = fetchSource(id);
		setSourceName(source.name);
	});

	return (
		<ScreenLayout>
			<Header
				handleClose={() => navigate(sourceRoutes.main)}
				handleSubmit={() => updateSource(id)}
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

export default SourceEdit;
