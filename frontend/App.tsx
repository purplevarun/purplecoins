import FontProvider from "./providers/FontProvider";
import DatabaseProvider from "./providers/DatabaseProvider";
import AuthRouter from "./screens/auth/AuthRouter";

const App = () => {
	return (
		<FontProvider>
			<DatabaseProvider>
				<AuthRouter />
			</DatabaseProvider>
		</FontProvider>
	);
};

export default App;
