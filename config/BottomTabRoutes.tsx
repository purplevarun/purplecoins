import FinanceScreen from "../router/screens/main/FinanceScreen";
import TodoScreen from "../router/screens/main/NoteScreen";
import PasswordScreen from "../router/screens/main/PasswordScreen";
import SettingScreen from "../router/screens/main/SettingScreen";

const BottomTabRoutes = {
	Finance: { page: FinanceScreen, icon: "indian-rupee-sign" },
	Passwords: { page: PasswordScreen, icon: "lock" },
	Todo: { page: TodoScreen, icon: "list-check" },
	Settings: { page: SettingScreen, icon: "gear" },
};

export default BottomTabRoutes;
