import { AppSidebar } from "@/layouts/Sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";
import Navbar from "@/layouts/Navbar";

const LayoutAdmin = () => {
  return (
    <>
      <div className="w-full h-screen overflow-hidden">
        <div className="font-poppins w-full h-screen overflow-hidden">
          <SidebarProvider>
            <AppSidebar />
            <main className="flex-1 overflow-hidden">
              <SidebarTrigger />
              <Navbar />
              <Outlet />
            </main>
          </SidebarProvider>
        </div>
      </div>
    </>
  );
};

export default LayoutAdmin;
