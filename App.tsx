import AppProvider from "./AppProvider";
import Router from "./Router";

const App = () => {
	return (
		<AppProvider>
			<Router />
		</AppProvider>
	);
};

// noinspection JSUnusedGlobalSymbols
export default App;
