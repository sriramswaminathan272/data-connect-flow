
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
import { ChevronDown, ChevronRight, Database, FlaskConical, BarChart2, BrainCircuit } from "lucide-react";

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
          ? "bg-blue-100 text-blue-700 font-medium" 
          : "text-slate-700 hover:bg-slate-100"
      )}
    >
      {React.cloneElement(icon as React.ReactElement, { 
        size: 16,
        className: cn("mr-2", isActive ? "text-blue-700" : "text-slate-500")
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
            <h2 className="text-xl font-bold mb-6 px-3">Data Analysis Hub</h2>
            
            <SidebarGroup>
              <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to="/connect" icon={<Database />}>Connect to Data Hub</NavLink>
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
                    <NavLink to="/ml" icon={<BrainCircuit />}>Machine Learning Toolbox</NavLink>
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
