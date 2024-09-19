import FontProvider from "./providers/FontProvider";
import LayoutProvider from "./providers/LayoutProvider";
import DatabaseProvider from "./providers/DatabaseProvider";
import BottomTabRouter from "./router/BottomTabRouter";
import Header from "./components/Header";

const App = () => {
	return (
		<LayoutProvider>
			<FontProvider>
				<DatabaseProvider>
					<Header />
					<BottomTabRouter />
				</DatabaseProvider>
			</FontProvider>
		</LayoutProvider>
	);
};

export default App;
