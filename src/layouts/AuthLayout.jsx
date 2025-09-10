import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-300 via-emerald-800 to-orange-300">
      <Outlet />
    </main>
  );
}