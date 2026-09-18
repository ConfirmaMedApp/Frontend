import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { navigate } from "@/lib/navigation";
import ModeToggle from "../components/custom/ModeToggle";
import ProfileModal from "../components/modals/ProfileModal";
import useAuth from "@/hooks/useAuth";

const Navbar = () => {
  const { getInfoUser, logout } = useAuth();
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="w-full bg-sidebar border-b shadow-sm px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <span className="font-bold text-lg ml-10 ">ConfirmaMed</span>
      </div>
      <div className="flex items-center gap-4 py-4 px-6 rounded-lg">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>
                {getInfoUser()?.fullName?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:flex items-center gap-4 focus-visible:no-underline">
              <div className="flex flex-col justify-start items-start">
                <span>{getInfoUser()?.fullName || "Usuario"}</span>
                <span className="text-xs text-muted-foreground">
                  <span className="font-bold"> Usuario: </span>{getInfoUser()?.userName ? getInfoUser()?.userName : "rol desconocido"}
                </span>
              </div>
              <ChevronDown className="h-4 w-4" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setProfileModalOpen(true)}>
              Perfil
            </DropdownMenuItem>
            <DropdownMenuSeparator className="sm:hidden" />
            <DropdownMenuItem onClick={handleLogout}>
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center gap-6">
          <ModeToggle />
        </div>
      </div>

      <ProfileModal
        open={profileModalOpen}
        onOpenChange={setProfileModalOpen}
      />
    </nav>
  );
};

export default Navbar;
