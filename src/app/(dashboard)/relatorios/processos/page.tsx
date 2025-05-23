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
const processosPorTipo = [
  { name: 'Aposentadoria', value: 45 },
  { name: 'Auxílio-doença', value: 30 },
  { name: 'Pensão', value: 15 },
  { name: 'Outros', value: 10 },
];

const processosPorStatus = [
  { name: 'Em andamento', value: 55 },
  { name: 'Concluído', value: 25 },
  { name: 'Arquivado', value: 15 },
  { name: 'Cancelado', value: 5 },
];

const processosPorMes = [
  { name: 'Jan', processos: 12 },
  { name: 'Fev', processos: 19 },
  { name: 'Mar', processos: 15 },
  { name: 'Abr', processos: 25 },
  { name: 'Mai', processos: 22 },
  { name: 'Jun', processos: 18 },
];

const atendimentosPorMes = [
  { name: 'Jan', atendimentos: 28 },
  { name: 'Fev', atendimentos: 35 },
  { name: 'Mar', atendimentos: 32 },
  { name: 'Abr', atendimentos: 42 },
  { name: 'Mai', atendimentos: 38 },
  { name: 'Jun', atendimentos: 45 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function RelatoriosProcessosPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Relatórios de Processos</h1>
        <Button>
          Exportar Relatórios
        </Button>
      </div>
      
      <Tabs defaultValue="processos">
        <TabsList className="mb-4">
          <TabsTrigger value="processos">Processos</TabsTrigger>
          <TabsTrigger value="atendimentos">Atendimentos</TabsTrigger>
          <TabsTrigger value="pericias">Perícias</TabsTrigger>
        </TabsList>
        
        <TabsContent value="processos" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Processos por Tipo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={processosPorTipo}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {processosPorTipo.map((entry, index) => (
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
                <CardTitle>Processos por Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={processosPorStatus}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {processosPorStatus.map((entry, index) => (
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
              <CardTitle>Processos por Mês</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={processosPorMes}
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
                    <Bar dataKey="processos" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total de Processos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">125</div>
                <p className="text-xs text-muted-foreground">+15% em relação ao período anterior</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Processos Ativos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">85</div>
                <p className="text-xs text-muted-foreground">68% do total</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Processos Concluídos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">35</div>
                <p className="text-xs text-muted-foreground">28% do total</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8.5 meses</div>
                <p className="text-xs text-muted-foreground">Da abertura à conclusão</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="atendimentos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Atendimentos por Mês</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={atendimentosPorMes}
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
                    <Line type="monotone" dataKey="atendimentos" stroke="#8884d8" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Atendimentos por Tipo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Consulta Inicial</span>
                      <span className="text-sm font-medium">45%</span>
                    </div>
                    <div className="mt-1 h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className="bg-primary h-full" style={{ width: '45%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Acompanhamento</span>
                      <span className="text-sm font-medium">30%</span>
                    </div>
                    <div className="mt-1 h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className="bg-primary h-full" style={{ width: '30%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Orientação</span>
                      <span className="text-sm font-medium">15%</span>
                    </div>
                    <div className="mt-1 h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className="bg-primary h-full" style={{ width: '15%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Outros</span>
                      <span className="text-sm font-medium">10%</span>
                    </div>
                    <div className="mt-1 h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className="bg-primary h-full" style={{ width: '10%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Resumo de Atendimentos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <h3 className="text-2xl font-bold">220</h3>
                    <p className="text-muted-foreground">Total de Atendimentos</p>
                  </div>
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <h3 className="text-2xl font-bold">36.7</h3>
                    <p className="text-muted-foreground">Média Mensal</p>
                  </div>
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <h3 className="text-2xl font-bold">45</h3>
                    <p className="text-muted-foreground">Maior Mês</p>
                  </div>
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <h3 className="text-2xl font-bold">85%</h3>
                    <p className="text-muted-foreground">Taxa de Conversão</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="pericias" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Perícias por Resultado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Favorável', value: 65 },
                        { name: 'Desfavorável', value: 25 },
                        { name: 'Inconclusivo', value: 10 },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[
                        { name: 'Favorável', value: 65 },
                        { name: 'Desfavorável', value: 25 },
                        { name: 'Inconclusivo', value: 10 },
                      ].map((entry, index) => (
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
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Total de Perícias</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center h-full">
                  <h3 className="text-4xl font-bold">85</h3>
                  <p className="text-muted-foreground">Realizadas nos últimos 6 meses</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Taxa de Sucesso</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center h-full">
                  <h3 className="text-4xl font-bold">65%</h3>
                  <p className="text-muted-foreground">Perícias com resultado favorável</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Tempo Médio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center h-full">
                  <h3 className="text-4xl font-bold">45</h3>
                  <p className="text-muted-foreground">Dias para agendamento</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
