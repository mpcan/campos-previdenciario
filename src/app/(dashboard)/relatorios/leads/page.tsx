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
const leadsPorOrigem = [
  { name: 'Site', value: 45 },
  { name: 'WhatsApp', value: 30 },
  { name: 'Indicação', value: 15 },
  { name: 'Redes Sociais', value: 10 },
];

const leadsPorMes = [
  { name: 'Jan', leads: 12 },
  { name: 'Fev', leads: 19 },
  { name: 'Mar', leads: 15 },
  { name: 'Abr', leads: 25 },
  { name: 'Mai', leads: 32 },
  { name: 'Jun', leads: 28 },
];

const taxaConversao = [
  { name: 'Jan', taxa: 15 },
  { name: 'Fev', taxa: 18 },
  { name: 'Mar', taxa: 22 },
  { name: 'Abr', taxa: 25 },
  { name: 'Mai', taxa: 30 },
  { name: 'Jun', taxa: 28 },
];

const campanhasPorStatus = [
  { name: 'Enviadas', value: 25 },
  { name: 'Em andamento', value: 5 },
  { name: 'Rascunho', value: 10 },
  { name: 'Falha', value: 3 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function RelatoriosLeadsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Relatórios - Leads e WhatsApp</h1>
        <Button>
          Exportar Relatórios
        </Button>
      </div>
      
      <Tabs defaultValue="leads">
        <TabsList className="mb-4">
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="campanhas">Campanhas</TabsTrigger>
          <TabsTrigger value="conversao">Conversão</TabsTrigger>
        </TabsList>
        
        <TabsContent value="leads" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Leads por Origem</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={leadsPorOrigem}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {leadsPorOrigem.map((entry, index) => (
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
                <CardTitle>Leads por Mês</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={leadsPorMes}
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
                      <Bar dataKey="leads" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Resumo de Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-muted rounded-lg p-4 text-center">
                  <h3 className="text-2xl font-bold">100</h3>
                  <p className="text-muted-foreground">Total de Leads</p>
                </div>
                <div className="bg-muted rounded-lg p-4 text-center">
                  <h3 className="text-2xl font-bold">25</h3>
                  <p className="text-muted-foreground">Leads Novos</p>
                </div>
                <div className="bg-muted rounded-lg p-4 text-center">
                  <h3 className="text-2xl font-bold">45</h3>
                  <p className="text-muted-foreground">Em Negociação</p>
                </div>
                <div className="bg-muted rounded-lg p-4 text-center">
                  <h3 className="text-2xl font-bold">30</h3>
                  <p className="text-muted-foreground">Convertidos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="campanhas" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Campanhas por Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={campanhasPorStatus}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {campanhasPorStatus.map((entry, index) => (
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
                <CardTitle>Resumo de Campanhas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <h3 className="text-2xl font-bold">43</h3>
                    <p className="text-muted-foreground">Total de Campanhas</p>
                  </div>
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <h3 className="text-2xl font-bold">1250</h3>
                    <p className="text-muted-foreground">Mensagens Enviadas</p>
                  </div>
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <h3 className="text-2xl font-bold">85%</h3>
                    <p className="text-muted-foreground">Taxa de Entrega</p>
                  </div>
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <h3 className="text-2xl font-bold">62%</h3>
                    <p className="text-muted-foreground">Taxa de Abertura</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="conversao" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Taxa de Conversão</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={taxaConversao}
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
                    <Line type="monotone" dataKey="taxa" stroke="#8884d8" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Leads por Campanha</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Campanha de Boas-vindas</span>
                    <span className="font-bold">15</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Campanha de Aposentadoria</span>
                    <span className="font-bold">23</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Campanha de Auxílio-doença</span>
                    <span className="font-bold">18</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Campanha de Pensão</span>
                    <span className="font-bold">12</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Tempo Médio de Conversão</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center h-full">
                  <h3 className="text-4xl font-bold">15</h3>
                  <p className="text-muted-foreground">Dias</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Custo por Lead</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center h-full">
                  <h3 className="text-4xl font-bold">R$ 25,00</h3>
                  <p className="text-muted-foreground">Média</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
