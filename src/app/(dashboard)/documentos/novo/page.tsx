import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

const documentoFormSchema = z.object({
  processo_id: z.string().min(1, { message: "Processo é obrigatório" }),
  nome: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres" }),
  tipo: z.string().min(1, { message: "Tipo é obrigatório" }),
  caminho_arquivo: z.string().min(1, { message: "Arquivo é obrigatório" }),
  status: z.string().min(1, { message: "Status é obrigatório" }),
});

type DocumentoFormValues = z.infer<typeof documentoFormSchema>;

export default function NovoDocumentoPage() {
  const form = useForm<DocumentoFormValues>({
    resolver: zodResolver(documentoFormSchema),
    defaultValues: {
      processo_id: "",
      nome: "",
      tipo: "",
      caminho_arquivo: "",
      status: "Novo",
    },
  });

  function onSubmit(data: DocumentoFormValues) {
    console.log(data);
    // Aqui seria implementada a chamada à API para salvar o documento
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Novo Documento</h1>
        <Link href="/documentos">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Dados do Documento</CardTitle>
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
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Documento*</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do documento" {...field} />
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
                        <Input placeholder="Tipo do documento" {...field} />
                        {/* Aqui seria implementado um select com os tipos */}
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
                        <Input placeholder="Status do documento" {...field} />
                        {/* Aqui seria implementado um select com os status */}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="caminho_arquivo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Arquivo*</FormLabel>
                    <FormControl>
                      <Input type="file" {...field} value={undefined} onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          field.onChange(file.name); // Simplificado para este exemplo
                        }
                      }} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end">
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Documento
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
