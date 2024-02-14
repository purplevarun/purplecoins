import { useState } from "react";

const AuthData = () => {
	const [loggedInUserName, setLoggedInUserName] = useState<null | string>(
		null,
	);
	return { loggedInUserName, setLoggedInUserName };
};
export default AuthData;
