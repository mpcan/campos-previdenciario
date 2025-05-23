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
const receitasPorMes = [
  { name: 'Jan', valor: 12500 },
  { name: 'Fev', valor: 15800 },
  { name: 'Mar', valor: 14200 },
  { name: 'Abr', valor: 18500 },
  { name: 'Mai', valor: 22000 },
  { name: 'Jun', valor: 19800 },
];

const despesasPorMes = [
  { name: 'Jan', valor: 8500 },
  { name: 'Fev', valor: 9200 },
  { name: 'Mar', valor: 8900 },
  { name: 'Abr', valor: 10500 },
  { name: 'Mai', valor: 11200 },
  { name: 'Jun', valor: 10800 },
];

const honorariosPorTipo = [
  { name: 'Consulta', value: 25 },
  { name: 'Processo Administrativo', value: 35 },
  { name: 'Processo Judicial', value: 30 },
  { name: 'Perícia', value: 10 },
];

const statusPagamentos = [
  { name: 'Pagos', value: 65 },
  { name: 'Pendentes', value: 25 },
  { name: 'Atrasados', value: 10 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function RelatoriosFinanceirosPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Relatórios Financeiros</h1>
        <Button>
          Exportar Relatórios
        </Button>
      </div>
      
      <Tabs defaultValue="receitas">
        <TabsList className="mb-4">
          <TabsTrigger value="receitas">Receitas</TabsTrigger>
          <TabsTrigger value="despesas">Despesas</TabsTrigger>
          <TabsTrigger value="honorarios">Honorários</TabsTrigger>
        </TabsList>
        
        <TabsContent value="receitas" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Receitas por Mês</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={receitasPorMes}
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
                    <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`} />
                    <Legend />
                    <Bar dataKey="valor" name="Receita (R$)" fill="#00C49F" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ 102.800,00</div>
                <p className="text-xs text-muted-foreground">+15% em relação ao período anterior</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Média Mensal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ 17.133,33</div>
                <p className="text-xs text-muted-foreground">Últimos 6 meses</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Maior Receita</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ 22.000,00</div>
                <p className="text-xs text-muted-foreground">Maio/2025</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Projeção Anual</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ 205.600,00</div>
                <p className="text-xs text-muted-foreground">Baseado na média atual</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="despesas" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Despesas por Mês</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={despesasPorMes}
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
                    <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`} />
                    <Legend />
                    <Bar dataKey="valor" name="Despesa (R$)" fill="#FF8042" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Despesas por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Salários</span>
                      <span className="text-sm font-medium">R$ 35.000,00</span>
                    </div>
                    <div className="mt-1 h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className="bg-primary h-full" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Aluguel</span>
                      <span className="text-sm font-medium">R$ 12.000,00</span>
                    </div>
                    <div className="mt-1 h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className="bg-primary h-full" style={{ width: '20%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Serviços</span>
                      <span className="text-sm font-medium">R$ 8.500,00</span>
                    </div>
                    <div className="mt-1 h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className="bg-primary h-full" style={{ width: '15%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Marketing</span>
                      <span className="text-sm font-medium">R$ 3.600,00</span>
                    </div>
                    <div className="mt-1 h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className="bg-primary h-full" style={{ width: '5%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Resumo de Despesas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <h3 className="text-2xl font-bold">R$ 59.100,00</h3>
                    <p className="text-muted-foreground">Total de Despesas</p>
                  </div>
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <h3 className="text-2xl font-bold">R$ 9.850,00</h3>
                    <p className="text-muted-foreground">Média Mensal</p>
                  </div>
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <h3 className="text-2xl font-bold">R$ 43.700,00</h3>
                    <p className="text-muted-foreground">Lucro Líquido</p>
                  </div>
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <h3 className="text-2xl font-bold">42,5%</h3>
                    <p className="text-muted-foreground">Margem de Lucro</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="honorarios" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Honorários por Tipo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={honorariosPorTipo}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {honorariosPorTipo.map((entry, index) => (
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
                <CardTitle>Status de Pagamentos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusPagamentos}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusPagamentos.map((entry, index) => (
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
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Honorários por Cliente (Top 5)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">João Silva</span>
                    <span className="text-sm font-medium">R$ 12.500,00</span>
                  </div>
                  <div className="mt-1 h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className="bg-primary h-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Maria Santos</span>
                    <span className="text-sm font-medium">R$ 9.800,00</span>
                  </div>
                  <div className="mt-1 h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className="bg-primary h-full" style={{ width: '78%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Pedro Oliveira</span>
                    <span className="text-sm font-medium">R$ 8.200,00</span>
                  </div>
                  <div className="mt-1 h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className="bg-primary h-full" style={{ width: '65%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Ana Souza</span>
                    <span className="text-sm font-medium">R$ 7.500,00</span>
                  </div>
                  <div className="mt-1 h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className="bg-primary h-full" style={{ width: '60%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Carlos Ferreira</span>
                    <span className="text-sm font-medium">R$ 6.800,00</span>
                  </div>
                  <div className="mt-1 h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className="bg-primary h-full" style={{ width: '54%' }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
