import FontProvider from "./util/font/FontProvider";
import AuthRouter from "./screens/auth/AuthRouter";
import DatabaseProvider from "./util/database/DatabaseProvider";

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
