import registerRootComponent from "expo/build/launch/registerRootComponent";
import AppSetup from "./AppSetup";
import Router from "./Router";

const App = () => {
	return (
		<AppSetup>
			<Router />
		</AppSetup>
	);
};

registerRootComponent(App);
