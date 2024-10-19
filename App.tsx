import FontProvider from "./providers/FontProvider";
import LayoutProvider from "./providers/LayoutProvider";
import DatabaseProvider from "./providers/DatabaseProvider";
import Router from "./screens/Router";
import Header from "./components/Header";

const App = () => {
	return (
		<LayoutProvider>
			<FontProvider>
				<DatabaseProvider>
					<Header />
					<Router />
				</DatabaseProvider>
			</FontProvider>
		</LayoutProvider>
	);
};

export default App;
