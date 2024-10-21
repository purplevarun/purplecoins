import FontProvider from "./providers/FontProvider";
import LayoutProvider from "./providers/LayoutProvider";
import DatabaseProvider from "./providers/DatabaseProvider";
import BottomRouter from "./bottom_router/BottomRouter";
import Header from "./components/Header";

const App = () => {
	return (
		<LayoutProvider>
			<FontProvider>
				<DatabaseProvider>
					<Header />
					<BottomRouter />
				</DatabaseProvider>
			</FontProvider>
		</LayoutProvider>
	);
};

export default App;
