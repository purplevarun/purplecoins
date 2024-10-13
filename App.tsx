import FontProvider from "./providers/FontProvider";
import LayoutProvider from "./providers/LayoutProvider";
import DatabaseProvider from "./providers/DatabaseProvider";
import RouterBottom from "./router/Router.Bottom";
import ComponentHeader from "./components/Component.Header";

const App = () => {
	return (
		<LayoutProvider>
			<FontProvider>
				<DatabaseProvider>
					<ComponentHeader />
					<RouterBottom />
				</DatabaseProvider>
			</FontProvider>
		</LayoutProvider>
	);
};

export default App;
