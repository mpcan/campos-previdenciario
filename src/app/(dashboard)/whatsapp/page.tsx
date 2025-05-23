import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { MessageSquare, Search, Send, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ChatWhatsAppPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">WhatsApp</h1>
        <Link href="/campanhas">
          <Button variant="outline">
            <MessageSquare className="mr-2 h-4 w-4" />
            Campanhas
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Contatos</CardTitle>
            <div className="flex items-center space-x-2 mt-2">
              <Input placeholder="Buscar contato" />
              <Button variant="outline" size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border rounded-md p-4 text-center text-muted-foreground">
                Nenhum contato encontrado
              </div>
              {/* Quando houver contatos, exibir desta forma:
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded-md hover:bg-muted cursor-pointer">
                  <div>
                    <p className="font-medium">João Silva</p>
                    <p className="text-sm text-muted-foreground">Última mensagem: 01/01/2025</p>
                  </div>
                  <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">
                    3
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-md hover:bg-muted cursor-pointer">
                  <div>
                    <p className="font-medium">Maria Santos</p>
                    <p className="text-sm text-muted-foreground">Última mensagem: 01/01/2025</p>
                  </div>
                </div>
              </div>
              */}
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Conversa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col h-[500px]">
              <div className="flex-1 overflow-y-auto p-4 space-y-4 border rounded-md mb-4">
                <div className="text-center text-muted-foreground py-10">
                  Selecione um contato para iniciar uma conversa
                </div>
                {/* Quando houver mensagens, exibir desta forma:
                <div className="flex flex-col space-y-2">
                  <div className="bg-muted p-3 rounded-lg max-w-[80%] self-start">
                    <p>Olá, gostaria de informações sobre aposentadoria.</p>
                    <p className="text-xs text-muted-foreground mt-1">10:30</p>
                  </div>
                  <div className="bg-primary text-primary-foreground p-3 rounded-lg max-w-[80%] self-end">
                    <p>Olá! Claro, posso ajudar com informações sobre aposentadoria. Qual é a sua situação atual?</p>
                    <p className="text-xs text-primary-foreground/70 mt-1">10:32 ✓✓</p>
                  </div>
                </div>
                */}
              </div>
              
              <div className="flex space-x-2">
                <Input placeholder="Digite sua mensagem..." disabled />
                <Button size="icon" disabled>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Modelos de Mensagem</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="atendimento">
            <TabsList className="mb-4">
              <TabsTrigger value="atendimento">Atendimento</TabsTrigger>
              <TabsTrigger value="informativo">Informativo</TabsTrigger>
              <TabsTrigger value="agendamento">Agendamento</TabsTrigger>
              <TabsTrigger value="lembrete">Lembrete</TabsTrigger>
            </TabsList>
            <TabsContent value="atendimento">
              <div className="space-y-4">
                <div className="border rounded-md p-4 hover:bg-muted cursor-pointer">
                  <div className="flex justify-between">
                    <h3 className="font-medium">Boas-vindas</h3>
                    <Button variant="ghost" size="sm">
                      <Send className="h-4 w-4 mr-2" />
                      Usar
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Olá, {{nome}}! Bem-vindo ao atendimento da PrevGestão. Como podemos ajudar você hoje?
                  </p>
                </div>
                <div className="border rounded-md p-4 hover:bg-muted cursor-pointer">
                  <div className="flex justify-between">
                    <h3 className="font-medium">Agradecimento</h3>
                    <Button variant="ghost" size="sm">
                      <Send className="h-4 w-4 mr-2" />
                      Usar
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Obrigado pelo seu contato, {{nome}}. Estamos à disposição para qualquer dúvida.
                  </p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="informativo">
              <div className="space-y-4">
                <div className="border rounded-md p-4 hover:bg-muted cursor-pointer">
                  <div className="flex justify-between">
                    <h3 className="font-medium">Informações sobre Aposentadoria</h3>
                    <Button variant="ghost" size="sm">
                      <Send className="h-4 w-4 mr-2" />
                      Usar
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Olá, {{nome}}! Para informações sobre aposentadoria, precisamos analisar seu tempo de contribuição e idade. Podemos agendar uma consulta?
                  </p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="agendamento">
              <div className="space-y-4">
                <div className="border rounded-md p-4 hover:bg-muted cursor-pointer">
                  <div className="flex justify-between">
                    <h3 className="font-medium">Confirmação de Atendimento</h3>
                    <Button variant="ghost" size="sm">
                      <Send className="h-4 w-4 mr-2" />
                      Usar
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Olá, {{nome}}! Confirmamos seu atendimento para o dia {{data}} às {{hora}}. Aguardamos sua presença.
                  </p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="lembrete">
              <div className="space-y-4">
                <div className="border rounded-md p-4 hover:bg-muted cursor-pointer">
                  <div className="flex justify-between">
                    <h3 className="font-medium">Lembrete de Perícia</h3>
                    <Button variant="ghost" size="sm">
                      <Send className="h-4 w-4 mr-2" />
                      Usar
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Olá, {{nome}}! Lembramos que sua perícia está agendada para o dia {{data}} às {{hora}} no local {{local}}. Não se esqueça de levar seus documentos.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
