import { createContext } from "react";
import LoginData from "./LoginData.tsx";

const loginContext = createContext({} as ReturnType<typeof LoginData>);

export default loginContext;
