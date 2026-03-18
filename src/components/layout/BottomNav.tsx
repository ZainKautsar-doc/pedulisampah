import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Home,
  MapPin,
  FileText,
  Trophy,
  User,
  Gift,
} from "lucide-react";
import { clsx } from "clsx";

export const BottomNav = () => {
  const { user } = useAuth();
  if (!user) return null;

  const homePath =
    user?.role === "komunitas"
      ? "/dashboard-komunitas"
      : user?.role === "admin"
        ? "/dashboard/admin"
        : "/dashboard/warga";

  const reportPath =
    user?.role === "komunitas"
      ? "/dashboard-komunitas/laporan"
      : user?.role === "admin"
        ? "/dashboard/admin/reports"
        : "/dashboard/warga/lapor";

  const profilePath =
    user?.role === "komunitas"
      ? "/dashboard-komunitas/profil"
      : user?.role === "admin"
        ? "/dashboard/admin/profil"
        : "/dashboard/warga/profil";

  const rewardPath =
    user?.role === "admin"
      ? "/dashboard/admin/rewards"
      : user?.role === "warga"
        ? "/dashboard/warga/reward"
        : null;

  const authLinks =
    user?.role === "admin" || user?.role === "warga"
      ? [
          { name: "Beranda", path: homePath, icon: Home },
          { name: "Laporan", path: reportPath, icon: FileText },
          {
            name: "Reward",
            path: rewardPath || "/dashboard/warga/reward",
            icon: Gift,
          },
          { name: "Peta", path: "/peta", icon: MapPin },
          { name: "Profil", path: profilePath, icon: User },
        ]
      : [
          { name: "Beranda", path: homePath, icon: Home },
          { name: "Laporan", path: reportPath, icon: FileText },
          { name: "Peta", path: "/peta", icon: MapPin },
          { name: "Leaderboard", path: "/leaderboard", icon: Trophy },
          { name: "Profil", path: profilePath, icon: User },
        ];

  const links = authLinks;

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
              link.path === "/dashboard/warga" ||
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
