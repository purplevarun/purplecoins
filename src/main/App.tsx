import registerRootComponent from "expo/build/launch/registerRootComponent";
import AppProvider from "../../AppProvider";
import Router from "../../Router";

const App = () => {
	return (
		<AppProvider>
			<Router />
		</AppProvider>
	);
};

registerRootComponent(App);
