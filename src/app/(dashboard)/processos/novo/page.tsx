import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

const processoFormSchema = z.object({
  cliente_id: z.string().min(1, { message: "Cliente é obrigatório" }),
  responsavel_id: z.string().min(1, { message: "Responsável é obrigatório" }),
  numero: z.string().optional(),
  tipo: z.string().min(1, { message: "Tipo é obrigatório" }),
  beneficio_tipo: z.string().optional(),
  status: z.string().min(1, { message: "Status é obrigatório" }),
  data_entrada: z.string().min(1, { message: "Data de entrada é obrigatória" }),
  data_distribuicao: z.string().optional(),
  vara: z.string().optional(),
  comarca: z.string().optional(),
  juiz: z.string().optional(),
  observacoes: z.string().optional(),
});

type ProcessoFormValues = z.infer<typeof processoFormSchema>;

export default function NovoProcessoPage() {
  const form = useForm<ProcessoFormValues>({
    resolver: zodResolver(processoFormSchema),
    defaultValues: {
      cliente_id: "",
      responsavel_id: "",
      numero: "",
      tipo: "",
      beneficio_tipo: "",
      status: "Novo",
      data_entrada: new Date().toISOString().split('T')[0],
      data_distribuicao: "",
      vara: "",
      comarca: "",
      juiz: "",
      observacoes: "",
    },
  });

  function onSubmit(data: ProcessoFormValues) {
    console.log(data);
    // Aqui seria implementada a chamada à API para salvar o processo
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Novo Processo</h1>
        <Link href="/processos">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Dados do Processo</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="cliente_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cliente*</FormLabel>
                      <FormControl>
                        <Input placeholder="Selecione o cliente" {...field} />
                        {/* Aqui seria implementado um select com os clientes */}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="responsavel_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Responsável*</FormLabel>
                      <FormControl>
                        <Input placeholder="Selecione o responsável" {...field} />
                        {/* Aqui seria implementado um select com os usuários */}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="numero"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número do Processo</FormLabel>
                      <FormControl>
                        <Input placeholder="Número do processo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="tipo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo*</FormLabel>
                      <FormControl>
                        <Input placeholder="Tipo do processo" {...field} />
                        {/* Aqui seria implementado um select com os tipos */}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="beneficio_tipo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Benefício</FormLabel>
                      <FormControl>
                        <Input placeholder="Tipo de benefício" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status*</FormLabel>
                      <FormControl>
                        <Input placeholder="Status do processo" {...field} />
                        {/* Aqui seria implementado um select com os status */}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="data_entrada"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Entrada*</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="data_distribuicao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Distribuição</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="vara"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vara</FormLabel>
                      <FormControl>
                        <Input placeholder="Vara" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="comarca"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Comarca</FormLabel>
                      <FormControl>
                        <Input placeholder="Comarca" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="juiz"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Juiz</FormLabel>
                      <FormControl>
                        <Input placeholder="Juiz" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="observacoes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Input placeholder="Observações sobre o processo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end">
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Processo
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
