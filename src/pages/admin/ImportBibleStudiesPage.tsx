import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, FileJson, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function ImportBibleStudiesPage() {
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{
    success?: boolean;
    totalImported?: number;
    totalSkipped?: number;
    errors?: string[];
  } | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      toast.error("Por favor, selecione um arquivo JSON");
      return;
    }

    setIsImporting(true);
    setProgress(10);
    setResult(null);

    try {
      const text = await file.text();
      setProgress(30);
      
      const bibleData = JSON.parse(text);
      setProgress(50);

      toast.info("Enviando dados para processamento...");

      const { data, error } = await supabase.functions.invoke("import-bible-studies", {
        body: { bibleData },
      });

      setProgress(100);

      if (error) {
        throw error;
      }

      setResult(data);
      
      if (data.success) {
        toast.success(`Importação concluída! ${data.totalImported} estudos importados.`);
      }
    } catch (error: any) {
      console.error("Import error:", error);
      toast.error(`Erro na importação: ${error.message}`);
      setResult({ success: false, errors: [error.message] });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Importar Estudos Bíblicos</h1>
          <p className="text-muted-foreground mt-2">
            Importe estudos bíblicos a partir de um arquivo JSON estruturado
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileJson className="h-5 w-5" />
              Arquivo JSON da Bíblia de Estudo
            </CardTitle>
            <CardDescription>
              Selecione o arquivo JSON contendo os estudos bíblicos para importar.
              O arquivo deve seguir o formato da Bíblia de Estudo ESV exportada.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Button asChild disabled={isImporting}>
                <label className="cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  Selecionar Arquivo JSON
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isImporting}
                  />
                </label>
              </Button>
            </div>

            {isImporting && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Importando estudos...</p>
                <Progress value={progress} />
              </div>
            )}

            {result && (
              <div className={`p-4 rounded-lg ${result.success ? 'bg-green-50 dark:bg-green-950' : 'bg-red-50 dark:bg-red-950'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {result.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className="font-medium">
                    {result.success ? 'Importação Concluída' : 'Erro na Importação'}
                  </span>
                </div>
                
                {result.totalImported !== undefined && (
                  <p className="text-sm">
                    <strong>{result.totalImported}</strong> estudos importados
                  </p>
                )}
                
                {result.totalSkipped !== undefined && result.totalSkipped > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {result.totalSkipped} entradas ignoradas (conteúdo muito curto)
                  </p>
                )}

                {result.errors && result.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-red-600">Erros:</p>
                    <ul className="text-xs text-red-500 max-h-40 overflow-y-auto">
                      {result.errors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Formato Esperado</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`{
  "bible_content": [
    {
      "abbrev": "gn",
      "chapters": [
        {
          "chapter_number": 1,
          "verses": [
            {
              "verse_number": 1,
              "text": "No princípio...",
              "studies": ["Comentário sobre o versículo..."]
            }
          ]
        }
      ]
    }
  ]
}`}
            </pre>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
