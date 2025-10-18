import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Route, Switch } from "wouter";
import AdminDashboard from "./admin/dashboard";
import AdminArticles from "./admin/articles";
import AdminTrends from "./admin/trends";

export default function AdminLayout() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between p-4 border-b border-border bg-background">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto p-6 bg-background">
            <Switch>
              <Route path="/admin/articles" component={AdminArticles} />
              <Route path="/admin/trends" component={AdminTrends} />
              <Route path="/admin" component={AdminDashboard} />
            </Switch>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
