import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { PlusCircle, Search, Edit, Trash, Eye, MessageSquare, Send } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function CampanhasPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Campanhas de WhatsApp</h1>
        <Link href="/campanhas/nova">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nova Campanha
          </Button>
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center space-x-2">
              <Input placeholder="Buscar por nome ou descrição" />
              <Button variant="outline" size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Lista de Campanhas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data de Criação</TableHead>
                <TableHead>Data de Envio</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                  Nenhuma campanha cadastrada
                </TableCell>
              </TableRow>
              {/* Quando houver campanhas, exibir desta forma:
              <TableRow>
                <TableCell>Campanha de Boas-vindas</TableCell>
                <TableCell>Mensagem de boas-vindas para novos leads</TableCell>
                <TableCell>Rascunho</TableCell>
                <TableCell>01/01/2025</TableCell>
                <TableCell>-</TableCell>
                <TableCell>João Silva</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Send className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              */}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
