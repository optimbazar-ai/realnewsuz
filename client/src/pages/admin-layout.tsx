import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { Route, Switch } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import AdminDashboard from "./admin/dashboard";
import AdminArticles from "./admin/articles";
import AdminTrends from "./admin/trends";
import AdminDrafts from "./admin/drafts";

export default function AdminLayout() {
  const { user, logout } = useAuth();
  
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
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span data-testid="text-username">{user?.username}</span>
              </div>
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => logout()}
                data-testid="button-logout"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Chiqish
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6 bg-background">
            <Switch>
              <Route path="/admin/articles" component={AdminArticles} />
              <Route path="/admin/drafts" component={AdminDrafts} />
              <Route path="/admin/trends" component={AdminTrends} />
              <Route path="/admin" component={AdminDashboard} />
            </Switch>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
