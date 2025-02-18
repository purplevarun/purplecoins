import registerRootComponent from "expo/build/launch/registerRootComponent";
import Router from "./Router";
import AppSetup from "./AppSetup";

const App = () => {
	return (
		<AppSetup>
			<Router />
		</AppSetup>
	);
};

registerRootComponent(App);
