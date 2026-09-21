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
import { useUserById } from "@/hooks/useUsers";

const Navbar = () => {
  const { getInfoUser, logout } = useAuth();
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const { data: userData } = useUserById(getInfoUser()?.id || 0);
  const avatarUrl = userData?.items?.avatarUrl;

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
            <Avatar className="size-10">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback>
                {getInfoUser()?.fullName?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:flex items-center gap-4 focus-visible:no-underline">
              <div className="flex flex-col justify-start items-start">
                <span>{getInfoUser()?.fullName || "Usuario"}</span>
                <span className="text-xs text-muted-foreground">
                  <span className="font-bold"> Usuario: </span>
                  {getInfoUser()?.userName
                    ? getInfoUser()?.userName
                    : "rol desconocido"}
                </span>
              </div>
              <ChevronDown className="h-4 w-4" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setProfileModalOpen(true)}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M19.2101 15.74L15.67 19.2801C15.53 19.4201 15.4 19.68 15.37 19.87L15.18 21.22C15.11 21.71 15.45 22.05 15.94 21.98L17.29 21.79C17.48 21.76 17.75 21.63 17.88 21.49L21.42 17.95C22.03 17.34 22.32 16.63 21.42 15.73C20.53 14.84 19.8201 15.13 19.2101 15.74Z"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-miterlimit="10"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M18.7001 16.25C19.0001 17.33 19.84 18.17 20.92 18.47"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-miterlimit="10"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M3.40991 22C3.40991 18.13 7.25994 15 11.9999 15C13.0399 15 14.0399 15.15 14.9699 15.43"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              Perfil
            </DropdownMenuItem>
            <DropdownMenuSeparator className="sm:hidden" />
            <DropdownMenuItem onClick={handleLogout}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M8.90002 7.55999C9.21002 3.95999 11.06 2.48999 15.11 2.48999H15.24C19.71 2.48999 21.5 4.27999 21.5 8.74999V15.27C21.5 19.74 19.71 21.53 15.24 21.53H15.11C11.09 21.53 9.24002 20.08 8.91002 16.54"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M15 12H3.62"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M5.85 8.6499L2.5 11.9999L5.85 15.3499"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
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
