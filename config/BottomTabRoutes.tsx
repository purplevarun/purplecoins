import FinanceScreen from "../screens/main/FinanceScreen";
import TodoScreen from "../screens/main/NoteScreen";
import PasswordScreen from "../screens/main/PasswordScreen";
import SettingScreen from "../screens/main/SettingScreen";

const BottomTabRoutes = {
	Finance: { page: FinanceScreen, icon: "indian-rupee-sign" },
	Passwords: { page: PasswordScreen, icon: "lock" },
	Todo: { page: TodoScreen, icon: "list-check" },
	Settings: { page: SettingScreen, icon: "gear" },
};

export default BottomTabRoutes;
