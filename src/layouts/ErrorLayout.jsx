import { Outlet } from "react-router-dom";

export default function ErrorLayout() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Outlet />
    </div>
  );
}