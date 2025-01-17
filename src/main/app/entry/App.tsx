import registerRootComponent from "expo/build/launch/registerRootComponent";
import Router from "../router/Router";
import AppSetup from "../setup/AppSetup";

const App = () => {
	return (
		<AppSetup>
			<Router />
		</AppSetup>
	);
};

registerRootComponent(App);
