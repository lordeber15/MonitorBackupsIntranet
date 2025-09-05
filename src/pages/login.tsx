import logo from "../assets/LOGO_MINEDU.png";
import { Link } from "react-router";
function login() {
  const year: number = new Date().getFullYear();

  return (
    <div className="">
      <div className="flex justify-center items-center flex-col gap-10 h-screen">
        <span className="flex justify-center text-center items-center mt-10">
          <span className="flex flex-col justify-end text-cyan-800 items-center">
            <span className="text-3xl font-bold">Educación Superior</span>
            <span className="text-2xl">pertinente y de calidad</span>
          </span>
        </span>
        <div className="flex justify-center flex-col  items-center p-2">
          <div className="flex flex-col border-1 border-gray-100 items-center justify-center gap-2 px-10 w-90 h-90 rounded-2xl shadow-2xl">
            <span className="text-3xl font-bold">Monitor</span>
            <img src={logo} alt="logo" className="w-60" />
            <input
              type="text"
              placeholder="Usuario"
              className="shadow-lg px-3 py-2 rounded-lg w-full border-gray-200 border-1 focus:outline-1 focus:outline-cyan-500"
            />
            <input
              type="password"
              placeholder="Contraseña"
              className="shadow-lg px-3 py-2 rounded-lg w-full border-gray-200 border-1 focus:outline-1 focus:outline-cyan-500"
            />
            <Link
              to={"/dashboard"}
              className="w-full rounded-lg py-2 cursor-pointer bg-cyan-700 text-white flex justify-center font-bold hover:bg-cyan-600 shadow-2xl "
            >
              Ingresar
            </Link>
          </div>
        </div>
        <div className="flex justify-center text-xs text-gray-400 p-10">
          Derechos reservados © {year}
        </div>
      </div>
    </div>
  );
}

export default login;
