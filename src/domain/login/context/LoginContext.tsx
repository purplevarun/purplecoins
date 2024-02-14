import { createContext } from "react";
import LoginData from "./LoginData.tsx";

const LoginContext = createContext({} as ReturnType<typeof LoginData>);

export default LoginContext;
