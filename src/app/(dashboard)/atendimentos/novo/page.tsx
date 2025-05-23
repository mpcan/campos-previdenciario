import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

const atendimentoFormSchema = z.object({
  cliente_id: z.string().min(1, { message: "Cliente é obrigatório" }),
  processo_id: z.string().optional(),
  responsavel_id: z.string().min(1, { message: "Responsável é obrigatório" }),
  data: z.string().min(1, { message: "Data é obrigatória" }),
  hora_inicio: z.string().min(1, { message: "Hora de início é obrigatória" }),
  hora_fim: z.string().optional(),
  tipo: z.string().min(1, { message: "Tipo é obrigatório" }),
  status: z.string().min(1, { message: "Status é obrigatório" }),
  observacoes: z.string().optional(),
});

type AtendimentoFormValues = z.infer<typeof atendimentoFormSchema>;

export default function NovoAtendimentoPage() {
  const form = useForm<AtendimentoFormValues>({
    resolver: zodResolver(atendimentoFormSchema),
    defaultValues: {
      cliente_id: "",
      processo_id: "",
      responsavel_id: "",
      data: new Date().toISOString().split('T')[0],
      hora_inicio: "",
      hora_fim: "",
      tipo: "",
      status: "Agendado",
      observacoes: "",
    },
  });

  function onSubmit(data: AtendimentoFormValues) {
    console.log(data);
    // Aqui seria implementada a chamada à API para salvar o atendimento
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Novo Atendimento</h1>
        <Link href="/atendimentos">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Dados do Atendimento</CardTitle>
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
                  name="processo_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Processo</FormLabel>
                      <FormControl>
                        <Input placeholder="Selecione o processo (opcional)" {...field} />
                        {/* Aqui seria implementado um select com os processos do cliente */}
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
                  name="tipo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo*</FormLabel>
                      <FormControl>
                        <Input placeholder="Tipo do atendimento" {...field} />
                        {/* Aqui seria implementado um select com os tipos */}
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
                  name="hora_inicio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hora de Início*</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="hora_fim"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hora de Término</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
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
                        <Input placeholder="Status do atendimento" {...field} />
                        {/* Aqui seria implementado um select com os status */}
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
                      <Input placeholder="Observações sobre o atendimento" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end">
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Atendimento
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
