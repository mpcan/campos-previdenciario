import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { PlusCircle, Search, Edit, Trash, Eye, Download, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function LeadsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Leads</h1>
        <div className="flex space-x-2">
          <Link href="/leads/importar">
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Importar Leads
            </Button>
          </Link>
          <Link href="/leads/novo">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo Lead
            </Button>
          </Link>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center space-x-2">
              <Input placeholder="Buscar por nome, telefone ou email" />
              <Button variant="outline" size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Lista de Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Última Interação</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                  Nenhum lead cadastrado
                </TableCell>
              </TableRow>
              {/* Quando houver leads, exibir desta forma:
              <TableRow>
                <TableCell>João Silva</TableCell>
                <TableCell>+5511999999999</TableCell>
                <TableCell>joao@email.com</TableCell>
                <TableCell>Site</TableCell>
                <TableCell>Novo</TableCell>
                <TableCell>01/01/2025</TableCell>
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
