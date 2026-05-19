import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  ChevronDown,
  ChevronRight,
  Database,
  FlaskConical,
  BarChart2,
  BrainCircuit,
  Sparkles,
  CalendarDays,
  LayoutDashboard,
} from "lucide-react";

interface NavGroupProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const NavGroup: React.FC<NavGroupProps> = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="mb-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center w-full px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md"
      >
        {isOpen ? <ChevronDown size={16} className="mr-1" /> : <ChevronRight size={16} className="mr-1" />}
        <span>{title}</span>
      </button>
      <div className={cn("pl-5", isOpen ? "block" : "hidden")}>
        {children}
      </div>
    </div>
  );
};

interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({ to, icon, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={cn(
        "flex items-center px-3 py-2 text-sm rounded-md",
        isActive
          ? "bg-indigo-100 text-indigo-700 font-medium"
          : "text-slate-700 hover:bg-slate-100"
      )}
    >
      {React.cloneElement(icon as React.ReactElement, {
        size: 16,
        className: cn("mr-2", isActive ? "text-indigo-600" : "text-slate-500")
      })}
      <span>{children}</span>
    </Link>
  );
};

const SideNavigation = () => {
  return (
    <SidebarProvider>
      <Sidebar className="bg-slate-50 border-r border-slate-200">
        <SidebarContent>
          <div className="px-3 py-4">
            <div className="flex items-center gap-2 px-3 mb-6">
              <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center">
                <Sparkles size={13} className="text-white" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Artisan</h2>
            </div>

            <SidebarGroup>
              <SidebarGroupLabel>Artisan</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to="/artisan" icon={<CalendarDays />}>Daily Surface</NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to="/onboarding" icon={<Sparkles />}>Onboarding</NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>

            <SidebarGroup className="mt-4">
              <SidebarGroupLabel>Data Tools</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to="/dashboard" icon={<LayoutDashboard />}>Dashboard</NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to="/connect" icon={<Database />}>Connect to Data</NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to="/hypothesis" icon={<FlaskConical />}>Hypothesis Testing</NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to="/scenario" icon={<BarChart2 />}>Scenario Analysis</NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to="/ml" icon={<BrainCircuit />}>Machine Learning</NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </div>
        </SidebarContent>
      </Sidebar>
      <SidebarTrigger className="fixed top-4 left-4 z-50" />
    </SidebarProvider>
  );
};

export default SideNavigation;
