import { ReactNode } from "react";
import { MainSidebar } from "./main-sidebar";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex h-screen">
      <MainSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center border-b px-6">
          <div className="ml-auto flex items-center space-x-4">
            <div className="relative">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Usuário</span>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
