import FontProvider from "./providers/FontProvider";
import LayoutProvider from "./providers/LayoutProvider";
import DatabaseProvider from "./providers/DatabaseProvider";
import AuthRouter from "./screens/auth/AuthRouter";

const App = () => {
	return (
		<LayoutProvider>
			<FontProvider>
				<DatabaseProvider>
					<AuthRouter />
				</DatabaseProvider>
			</FontProvider>
		</LayoutProvider>
	);
};

export default App;
