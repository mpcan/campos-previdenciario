import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowLeft, Save, Upload } from "lucide-react";
import Link from "next/link";

const importacaoSchema = z.object({
  arquivo: z.any().refine((file) => file?.name, { message: "Arquivo é obrigatório" }),
  formato: z.string().min(1, { message: "Formato é obrigatório" }),
});

type ImportacaoFormValues = z.infer<typeof importacaoSchema>;

export default function ImportarLeadsPage() {
  const form = useForm<ImportacaoFormValues>({
    resolver: zodResolver(importacaoSchema),
    defaultValues: {
      arquivo: undefined,
      formato: "csv",
    },
  });

  function onSubmit(data: ImportacaoFormValues) {
    console.log(data);
    // Aqui seria implementada a chamada à API para importar os leads
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Importar Leads</h1>
        <Link href="/leads">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Importação de Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="arquivo"
                  render={({ field: { value, onChange, ...field } }) => (
                    <FormItem>
                      <FormLabel>Arquivo (CSV ou Excel)*</FormLabel>
                      <FormControl>
                        <Input 
                          type="file" 
                          accept=".csv,.xlsx,.xls" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            onChange(file);
                          }}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="formato"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Formato*</FormLabel>
                      <FormControl>
                        <div className="flex space-x-4">
                          <label className="flex items-center space-x-2">
                            <input 
                              type="radio" 
                              value="csv" 
                              checked={field.value === "csv"}
                              onChange={() => field.onChange("csv")}
                            />
                            <span>CSV</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input 
                              type="radio" 
                              value="excel" 
                              checked={field.value === "excel"}
                              onChange={() => field.onChange("excel")}
                            />
                            <span>Excel</span>
                          </label>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Instruções</h3>
                <p>O arquivo deve conter as seguintes colunas:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Nome (obrigatório)</li>
                  <li>Telefone (obrigatório)</li>
                  <li>Email</li>
                  <li>Interesse</li>
                  <li>Observações</li>
                </ul>
                <p>Exemplo de CSV:</p>
                <pre className="bg-muted p-2 rounded text-sm">
                  nome,telefone,email,interesse,observacoes<br/>
                  João Silva,11999999999,joao@email.com,Aposentadoria,Cliente potencial<br/>
                  Maria Santos,11888888888,maria@email.com,Auxílio-doença,Indicação
                </pre>
              </div>
              
              <div className="flex justify-end">
                <Button type="submit">
                  <Upload className="mr-2 h-4 w-4" />
                  Importar Leads
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
