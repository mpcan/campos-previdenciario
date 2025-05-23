import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

const periciaFormSchema = z.object({
  processo_id: z.string().min(1, { message: "Processo é obrigatório" }),
  cliente_id: z.string().min(1, { message: "Cliente é obrigatório" }),
  data: z.string().min(1, { message: "Data é obrigatória" }),
  hora: z.string().min(1, { message: "Hora é obrigatória" }),
  local: z.string().optional(),
  perito: z.string().optional(),
  status: z.string().min(1, { message: "Status é obrigatório" }),
  resultado: z.string().optional(),
  observacoes: z.string().optional(),
});

type PericiaFormValues = z.infer<typeof periciaFormSchema>;

export default function NovaPericiaPage() {
  const form = useForm<PericiaFormValues>({
    resolver: zodResolver(periciaFormSchema),
    defaultValues: {
      processo_id: "",
      cliente_id: "",
      data: new Date().toISOString().split('T')[0],
      hora: "",
      local: "",
      perito: "",
      status: "Agendada",
      resultado: "",
      observacoes: "",
    },
  });

  function onSubmit(data: PericiaFormValues) {
    console.log(data);
    // Aqui seria implementada a chamada à API para salvar a perícia
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Nova Perícia</h1>
        <Link href="/pericias">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Dados da Perícia</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="processo_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Processo*</FormLabel>
                      <FormControl>
                        <Input placeholder="Selecione o processo" {...field} />
                        {/* Aqui seria implementado um select com os processos */}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
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
                  name="data"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data*</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="hora"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hora*</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="local"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Local</FormLabel>
                      <FormControl>
                        <Input placeholder="Local da perícia" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="perito"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Perito</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do perito" {...field} />
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
                        <Input placeholder="Status da perícia" {...field} />
                        {/* Aqui seria implementado um select com os status */}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="resultado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resultado</FormLabel>
                      <FormControl>
                        <Input placeholder="Resultado da perícia" {...field} />
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
                      <Input placeholder="Observações sobre a perícia" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end">
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Perícia
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
