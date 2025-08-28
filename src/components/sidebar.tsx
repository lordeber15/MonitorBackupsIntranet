import { useState } from "react";
import { RxHamburgerMenu } from "react-icons/rx";
import { IoClose } from "react-icons/io5";
import BtnSidebar from "./btnSidebar";
function Slider() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div
      className={`h-screen transition-all duration-300 shadow ${
        isOpen ? "w-72" : "w-20"
      }`}
    >
      <div
        className={`p-4 flex items-center justify-between transition-all ${
          isOpen ? "justify-between" : "justify-center"
        }`}
      >
        {isOpen && <h1 className="text-2xl font-bold">TIC</h1>}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-xl hover:bg-gray-100 p-2 rounded-md"
        >
          {isOpen ? <IoClose /> : <RxHamburgerMenu />}
        </button>
      </div>
      <BtnSidebar open={isOpen} />
    </div>
  );
}

export default Slider;
