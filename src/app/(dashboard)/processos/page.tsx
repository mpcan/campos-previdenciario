import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { PlusCircle, Search, Edit, Trash, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function ProcessosPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Processos</h1>
        <Link href="/processos/novo">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Processo
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
              <Input placeholder="Buscar por número, cliente ou tipo" />
              <Button variant="outline" size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Lista de Processos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Benefício</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                  Nenhum processo cadastrado
                </TableCell>
              </TableRow>
              {/* Quando houver processos, exibir desta forma:
              <TableRow>
                <TableCell>123456789</TableCell>
                <TableCell>Nome do Cliente</TableCell>
                <TableCell>Administrativo</TableCell>
                <TableCell>Aposentadoria por Tempo de Contribuição</TableCell>
                <TableCell>Em andamento</TableCell>
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
