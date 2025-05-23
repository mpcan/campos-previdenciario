import { Sidebar, SidebarContent, SidebarHeader, SidebarItem } from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Users, 
  FileText, 
  Calendar, 
  FileCheck, 
  BarChart3, 
  Settings,
  MessageSquare,
  Home
} from "lucide-react";

export function MainSidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  return (
    <Sidebar defaultOpen={true} className="border-r">
      <SidebarHeader className="flex items-center justify-center">
        <h1 className="text-xl font-bold">PrevGestão</h1>
      </SidebarHeader>
      <SidebarContent className="space-y-1">
        <Link href="/dashboard">
          <SidebarItem active={isActive("/dashboard")}>
            <Home className="mr-2 h-4 w-4" />
            Dashboard
          </SidebarItem>
        </Link>
        <Link href="/clientes">
          <SidebarItem active={isActive("/clientes")}>
            <Users className="mr-2 h-4 w-4" />
            Clientes
          </SidebarItem>
        </Link>
        <Link href="/processos">
          <SidebarItem active={isActive("/processos")}>
            <FileText className="mr-2 h-4 w-4" />
            Processos
          </SidebarItem>
        </Link>
        <Link href="/atendimentos">
          <SidebarItem active={isActive("/atendimentos")}>
            <MessageSquare className="mr-2 h-4 w-4" />
            Atendimentos
          </SidebarItem>
        </Link>
        <Link href="/pericias">
          <SidebarItem active={isActive("/pericias")}>
            <Calendar className="mr-2 h-4 w-4" />
            Perícias
          </SidebarItem>
        </Link>
        <Link href="/documentos">
          <SidebarItem active={isActive("/documentos")}>
            <FileCheck className="mr-2 h-4 w-4" />
            Documentos
          </SidebarItem>
        </Link>
        <Link href="/relatorios">
          <SidebarItem active={isActive("/relatorios")}>
            <BarChart3 className="mr-2 h-4 w-4" />
            Relatórios
          </SidebarItem>
        </Link>
        <Link href="/configuracoes">
          <SidebarItem active={isActive("/configuracoes")}>
            <Settings className="mr-2 h-4 w-4" />
            Configurações
          </SidebarItem>
        </Link>
      </SidebarContent>
    </Sidebar>
  );
}
