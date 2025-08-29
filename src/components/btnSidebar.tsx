import { SiSpeedtest } from "react-icons/si";
import { LuDatabaseBackup } from "react-icons/lu";
import { MdOutlineMonitorHeart } from "react-icons/md";
import { MdOutlineDashboard } from "react-icons/md";
import { Link } from "react-router";

function btnSlider({ open }: { open: boolean }) {
  return (
    <nav className="mt-4 px-2 flex flex-col gap-2">
      <Link
        to={"/dashboard"}
        className={`w-full py-2 px-4 flex hover:shadow-lg ${
          open ? "justify-start" : "justify-center"
        } items-center border-gray-200 font-bold rounded-lg hover:bg-gray-100 transition-all`}
      >
        <div className="flex gap-2 items-center transition-all">
          <MdOutlineDashboard />
          {open ? <div>Dashboard</div> : ""}
        </div>
      </Link>
      <Link
        to={"/speedtest"}
        className={`w-full py-2 px-4 flex hover:shadow-lg ${
          open ? "justify-start" : "justify-center"
        } items-center border-gray-200 font-bold rounded-lg hover:bg-gray-100 transition-all`}
      >
        <div className="flex gap-2 items-center transition-all cursor-pointer">
          <SiSpeedtest />
          {open ? <div>SpeedTests</div> : ""}
        </div>
      </Link>
      <Link
        to={"/backup"}
        className={`w-full py-2 px-4 flex hover:shadow-lg ${
          open ? "justify-start" : "justify-center"
        } items-center border-gray-200 font-bold rounded-lg hover:bg-gray-100 transition-all`}
      >
        <div className="flex gap-2 items-center transition-all">
          <LuDatabaseBackup />
          {open ? <div>Backup</div> : ""}
        </div>
      </Link>
      <Link
        to={"/monitor"}
        className={`w-full py-2 px-4 flex hover:shadow-lg ${
          open ? "justify-start" : "justify-center"
        } items-center border-gray-200 font-bold rounded-lg hover:bg-gray-100 transition-all`}
      >
        <div className="flex gap-2 items-center transition-all">
          <MdOutlineMonitorHeart />
          {open ? <div>Monitor</div> : ""}
        </div>
      </Link>
    </nav>
  );
}

export default btnSlider;
