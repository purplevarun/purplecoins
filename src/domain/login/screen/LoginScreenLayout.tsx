import { ReactNode } from "react";

const LoginScreenLayout = ({ children }: { children: ReactNode }) => {
	return (
		<form
			autoComplete="off"
			id="layout"
			style={{ alignItems: "center" }}
			onSubmit={(event) => event.preventDefault()}
			children={children}
		/>
	);
};
export default LoginScreenLayout;
