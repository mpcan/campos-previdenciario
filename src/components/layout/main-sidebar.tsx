"use client"
 
import { Sidebar, SidebarContent, SidebarHeader, SidebarItem } from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Users, 
  FileText, 
  BarChart2, 
  MessageSquare, 
  Calendar, 
  Settings,
  Briefcase,
  Scale,
  Search,
  Bell,
  Megaphone
} from "lucide-react";

export function MainSidebar() {
  const pathname = usePathname();
  
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center space-x-2 px-6 py-4">
          <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-white font-bold">P</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">PowerPrev</h2>
            <p className="text-xs text-gray-500">Gestão Previdenciária</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarItem 
          icon={<Users className="h-5 w-5" />}
          href="/clientes"
          active={pathname?.startsWith('/clientes')}
          as={Link}
        >
          Clientes
        </SidebarItem>
        <SidebarItem 
          icon={<Briefcase className="h-5 w-5" />}
          href="/processos"
          active={pathname?.startsWith('/processos')}
          as={Link}
        >
          Processos
        </SidebarItem>
        <SidebarItem 
          icon={<Scale className="h-5 w-5" />}
          href="/jurisprudencia"
          active={pathname?.startsWith('/jurisprudencia')}
          as={Link}
        >
          Jurisprudência
        </SidebarItem>
        <SidebarItem 
          icon={<MessageSquare className="h-5 w-5" />}
          href="/atendimentos"
          active={pathname?.startsWith('/atendimentos')}
          as={Link}
        >
          Atendimentos
        </SidebarItem>
        <SidebarItem 
          icon={<Megaphone className="h-5 w-5" />}
          href="/campanhas"
          active={pathname?.startsWith('/campanhas')}
          as={Link}
        >
          Campanhas
        </SidebarItem>
        <SidebarItem 
          icon={<Calendar className="h-5 w-5" />}
          href="/agenda"
          active={pathname?.startsWith('/agenda')}
          as={Link}
        >
          Agenda
        </SidebarItem>
        <SidebarItem 
          icon={<FileText className="h-5 w-5" />}
          href="/documentos"
          active={pathname?.startsWith('/documentos')}
          as={Link}
        >
          Documentos
        </SidebarItem>
        <SidebarItem 
          icon={<BarChart2 className="h-5 w-5" />}
          href="/relatorios"
          active={pathname?.startsWith('/relatorios')}
          as={Link}
        >
          Relatórios
        </SidebarItem>
        <SidebarItem 
          icon={<Bell className="h-5 w-5" />}
          href="/notificacoes"
          active={pathname?.startsWith('/notificacoes')}
          as={Link}
        >
          Notificações
        </SidebarItem>
        <SidebarItem 
          icon={<Settings className="h-5 w-5" />}
          href="/configuracoes"
          active={pathname?.startsWith('/configuracoes')}
          as={Link}
        >
          Configurações
        </SidebarItem>
      </SidebarContent>
    </Sidebar>
  );
}
