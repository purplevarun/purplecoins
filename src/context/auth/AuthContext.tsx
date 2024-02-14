import { createContext } from "react";
import AuthData from "./AuthData.tsx";

const AuthContext = createContext({} as ReturnType<typeof AuthData>);
export default AuthContext;
