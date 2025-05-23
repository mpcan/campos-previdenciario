import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { PlusCircle, Search, Edit, Trash, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function AtendimentosPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Atendimentos</h1>
        <Link href="/atendimentos/novo">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Atendimento
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
              <Input placeholder="Buscar por cliente ou responsável" />
              <Button variant="outline" size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Lista de Atendimentos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Hora</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Processo</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                  Nenhum atendimento cadastrado
                </TableCell>
              </TableRow>
              {/* Quando houver atendimentos, exibir desta forma:
              <TableRow>
                <TableCell>01/01/2025</TableCell>
                <TableCell>14:00</TableCell>
                <TableCell>Nome do Cliente</TableCell>
                <TableCell>123456789</TableCell>
                <TableCell>Consulta</TableCell>
                <TableCell>Agendado</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Edit className="h-4 w-4" />
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
