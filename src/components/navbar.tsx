function navbar() {
  return (
    <div className="flex">
      <div className="h-16 w-full shadow-md px-7 flex justify-between items-center">
        <div className="flex gap-2 items-center">
          <div>Monitor</div>
        </div>
        <div className="flex gap-2 items-center">
          <div>Nombre!</div>
          <button className="rounded-full border-1 border-gray-200 h-10 w-10 shadow-md">
            N
          </button>
        </div>
      </div>
    </div>
  );
}

export default navbar;
