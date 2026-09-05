import { ChevronUp, User2, LogOut, ChevronDown } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Link, useNavigate } from "react-router-dom";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "../components/ui/collapsible";
import LogoConfirmamed from "../components/custom/LogoConfirmamed";
import useAuth from "@/hooks/useAuth";
import { menuItems } from "@/config/menuConfig";

export const AppSidebar = () => {
  const { getInfoUser, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <Sidebar collapsible="icon" className="relative">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/specialities">
                <div>
                  <LogoConfirmamed width={20} height={20} />
                </div>
                <span>ConfirmaMed</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((module) => {
                if (module.childrens && module.childrens?.length > 0) {
                  return (
                    <Collapsible
                      key={module.title}
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <CollapsibleTrigger asChild>
                              <SidebarMenuButton>
                                {module.icon && <module.icon />}
                                <span>{module.title}</span>
                                <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                              </SidebarMenuButton>
                            </CollapsibleTrigger>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            {module.title}
                          </TooltipContent>
                        </Tooltip>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {module.childrens.map((child) => (
                              <SidebarMenuSubItem key={child.title}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <SidebarMenuSubButton asChild>
                                      {child.to ? (
                                        <Link to={child.to}>
                                          {child.icon && <child.icon />}
                                          <span>{child.title}</span>
                                        </Link>
                                      ) : (
                                        <a
                                          href={child.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                        >
                                          {child.icon && <child.icon />}
                                          <span>{child.title}</span>
                                        </a>
                                      )}
                                    </SidebarMenuSubButton>
                                  </TooltipTrigger>
                                  <TooltipContent side="right">
                                    {child.title}
                                  </TooltipContent>
                                </Tooltip>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                } else {
                  return (
                    <SidebarMenuItem key={module.title}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          {module.to ? (
                            <SidebarMenuButton asChild>
                              <Link to={module.to}>
                                {module.icon && <module.icon />}
                                {/* Ocultamos el texto en el sidebar si queremos solo icono */}
                                <span>{module.title}</span>
                              </Link>
                            </SidebarMenuButton>
                          ) : (
                            <SidebarMenuButton asChild>
                              <a
                                href={module.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {module.icon && <module.icon />}
                                <span>{module.title}</span>
                              </a>
                            </SidebarMenuButton>
                          )}
                        </TooltipTrigger>

                        {/* Contenido que aparece al hacer hover */}
                        <TooltipContent side="right">
                          {module.title}
                        </TooltipContent>
                      </Tooltip>
                    </SidebarMenuItem>
                  );
                }
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="truncate">
                  <User2 /> {getInfoUser()?.fullName || "Usuario"}
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width]"
              >
                <DropdownMenuItem>
                  <button
                    className="flex gap-2 items-center"
                    onClick={() => {
                      logout();
                      navigate("/login");
                    }}
                  >
                    <LogOut />
                    <span>Cerrar sesión</span>
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};
