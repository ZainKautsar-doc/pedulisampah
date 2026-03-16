import { NavLink } from "react-router-dom";
import { useAppContext } from "../../store/AppContext";
import {
  Home,
  MapPin,
  FileText,
  Trophy,
  User,
  Gift,
  History,
} from "lucide-react";
import { clsx } from "clsx";

export const BottomNav = () => {
  const { currentUser } = useAppContext();

  const publicLinks = [
    { name: "Beranda", path: "/", icon: Home },
    { name: "Laporan", path: "/login", icon: FileText },
    { name: "Peta", path: "/peta", icon: MapPin },
    { name: "Leaderboard", path: "/leaderboard", icon: Trophy },
    { name: "Profil", path: "/login", icon: User },
  ];

  const wargaLinks = [
    { name: "Beranda", path: "/dashboard", icon: Home },
    { name: "Laporan", path: "/dashboard/lapor", icon: FileText },
    { name: "Reward", path: "/dashboard/reward", icon: Gift },
    { name: "Peta", path: "/peta", icon: MapPin },
    { name: "Profil", path: "/dashboard/profil", icon: User },
  ];

  const komunitasLinks = [
    { name: "Beranda", path: "/dashboard-komunitas", icon: Home },
    { name: "Laporan", path: "/dashboard-komunitas/laporan", icon: FileText },
    { name: "Peta", path: "/peta", icon: MapPin },
    { name: "Leaderboard", path: "/leaderboard", icon: Trophy },
    { name: "Profil", path: "/dashboard-komunitas/profil", icon: User },
  ];

  const adminLinks = [
    { name: "Beranda", path: "/dashboard/admin", icon: Home },
    { name: "Laporan", path: "/dashboard/admin/reports", icon: FileText },
    { name: "Reward", path: "/dashboard/admin/rewards", icon: Gift },
    { name: "Redeem", path: "/dashboard/admin/redeems", icon: History },
    { name: "Profil", path: "/dashboard/admin", icon: User },
  ];

  let links = publicLinks;
  if (currentUser?.role === "warga") links = wargaLinks;
  if (currentUser?.role === "komunitas") links = komunitasLinks;
  if (currentUser?.role === "admin") links = adminLinks;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden bg-white border-t border-slate-200 shadow-[0_-6px_18px_rgba(15,23,42,0.08)]">
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <NavLink
            key={link.name}
            to={link.path}
            end={
              link.path === "/" ||
              link.path === "/dashboard" ||
              link.path === "/dashboard-komunitas" ||
              link.path === "/dashboard/admin"
            }
            className={({ isActive }) =>
              clsx(
                "relative flex-1 flex flex-col items-center justify-center gap-1 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]",
                isActive ? "text-emerald-600" : "text-slate-500",
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={clsx(
                    "absolute top-0 h-0.5 w-10 rounded-full transition-colors",
                    isActive ? "bg-emerald-500" : "bg-transparent",
                  )}
                />
                <Icon className="h-5 w-5" />
                <span className="text-[11px] leading-none font-medium">
                  {link.name}
                </span>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
};
