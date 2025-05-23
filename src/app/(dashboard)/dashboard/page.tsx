import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  Cell 
} from "recharts";

// Dados de exemplo para os gráficos
const tarefasPorStatus = [
  { name: 'Pendente', value: 35 },
  { name: 'Em andamento', value: 25 },
  { name: 'Concluída', value: 40 },
];

const tarefasPorResponsavel = [
  { name: 'João', tarefas: 15 },
  { name: 'Maria', tarefas: 22 },
  { name: 'Pedro', tarefas: 18 },
  { name: 'Ana', tarefas: 12 },
  { name: 'Carlos', tarefas: 8 },
];

const tarefasPorPrioridade = [
  { name: 'Alta', value: 25 },
  { name: 'Média', value: 45 },
  { name: 'Baixa', value: 30 },
];

const produtividadeMensal = [
  { name: 'Jan', tarefas: 28, processos: 12 },
  { name: 'Fev', tarefas: 35, processos: 19 },
  { name: 'Mar', tarefas: 32, processos: 15 },
  { name: 'Abr', tarefas: 42, processos: 25 },
  { name: 'Mai', tarefas: 38, processos: 22 },
  { name: 'Jun', tarefas: 45, processos: 18 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button>
          Exportar Relatórios
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">248</div>
            <p className="text-xs text-muted-foreground">+12% em relação ao mês anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Processos Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85</div>
            <p className="text-xs text-muted-foreground">+5% em relação ao mês anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Leads Novos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32</div>
            <p className="text-xs text-muted-foreground">+18% em relação ao mês anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 22.000,00</div>
            <p className="text-xs text-muted-foreground">+8% em relação ao mês anterior</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tarefas por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tarefasPorStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {tarefasPorStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Tarefas por Responsável</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={tarefasPorResponsavel}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="tarefas" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Produtividade Mensal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={produtividadeMensal}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="tarefas" stroke="#8884d8" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="processos" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Próximos Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center p-3 border rounded-md">
                <div className="bg-primary w-2 h-12 rounded-full mr-4"></div>
                <div className="flex-1">
                  <h3 className="font-medium">Audiência - João Silva</h3>
                  <p className="text-sm text-muted-foreground">Hoje, 14:00 - Fórum Central</p>
                </div>
              </div>
              <div className="flex items-center p-3 border rounded-md">
                <div className="bg-yellow-500 w-2 h-12 rounded-full mr-4"></div>
                <div className="flex-1">
                  <h3 className="font-medium">Perícia - Maria Santos</h3>
                  <p className="text-sm text-muted-foreground">Amanhã, 10:30 - INSS</p>
                </div>
              </div>
              <div className="flex items-center p-3 border rounded-md">
                <div className="bg-green-500 w-2 h-12 rounded-full mr-4"></div>
                <div className="flex-1">
                  <h3 className="font-medium">Reunião de Equipe</h3>
                  <p className="text-sm text-muted-foreground">20/04/2025, 09:00 - Escritório</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Tarefas Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center p-3 border rounded-md">
                <div className="bg-red-500 w-2 h-12 rounded-full mr-4"></div>
                <div className="flex-1">
                  <h3 className="font-medium">Enviar documentação - Processo 12345</h3>
                  <p className="text-sm text-muted-foreground">Vence hoje - Alta prioridade</p>
                </div>
              </div>
              <div className="flex items-center p-3 border rounded-md">
                <div className="bg-yellow-500 w-2 h-12 rounded-full mr-4"></div>
                <div className="flex-1">
                  <h3 className="font-medium">Preparar relatório mensal</h3>
                  <p className="text-sm text-muted-foreground">Vence em 2 dias - Média prioridade</p>
                </div>
              </div>
              <div className="flex items-center p-3 border rounded-md">
                <div className="bg-blue-500 w-2 h-12 rounded-full mr-4"></div>
                <div className="flex-1">
                  <h3 className="font-medium">Contatar cliente - Pedro Oliveira</h3>
                  <p className="text-sm text-muted-foreground">Vence em 5 dias - Baixa prioridade</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
