import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowLeft, Save, Plus, Users } from "lucide-react";
import Link from "next/link";

const campanhaFormSchema = z.object({
  nome: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres" }),
  descricao: z.string().optional(),
  mensagem: z.string().min(5, { message: "Mensagem deve ter pelo menos 5 caracteres" }),
  responsavel_id: z.string().optional(),
});

type CampanhaFormValues = z.infer<typeof campanhaFormSchema>;

export default function NovaCampanhaPage() {
  const form = useForm<CampanhaFormValues>({
    resolver: zodResolver(campanhaFormSchema),
    defaultValues: {
      nome: "",
      descricao: "",
      mensagem: "",
      responsavel_id: "",
    },
  });

  function onSubmit(data: CampanhaFormValues) {
    console.log(data);
    // Aqui seria implementada a chamada à API para salvar a campanha
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Nova Campanha de WhatsApp</h1>
        <Link href="/campanhas">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Dados da Campanha</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Campanha*</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome da campanha" {...field} />
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
                      <FormLabel>Responsável</FormLabel>
                      <FormControl>
                        <Input placeholder="Selecione o responsável" {...field} />
                        {/* Aqui seria implementado um select com os usuários */}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="descricao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Input placeholder="Descrição da campanha" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="mensagem"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mensagem*</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Digite a mensagem que será enviada. Você pode usar variáveis como {{nome}} para personalizar." 
                        className="min-h-[150px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-sm text-muted-foreground">
                      Variáveis disponíveis: {{nome}}, {{telefone}}, {{email}}
                    </p>
                  </FormItem>
                )}
              />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Destinatários</h3>
                  <Button type="button" variant="outline">
                    <Users className="mr-2 h-4 w-4" />
                    Selecionar Leads
                  </Button>
                </div>
                <div className="border rounded-md p-4">
                  <p className="text-center text-muted-foreground">
                    Nenhum destinatário selecionado. Clique em "Selecionar Leads" para adicionar destinatários.
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="submit" variant="outline">
                  Salvar como Rascunho
                </Button>
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  Salvar e Enviar
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
