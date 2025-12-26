import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { useStrongsTranslation } from '@/hooks/useStrongsTranslation';
import { Languages, Download, Play, RefreshCw, Search, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { useState } from 'react';

export default function AdminStrongsPage() {
  const {
    translations,
    stats,
    isLoading,
    isTranslating,
    progress,
    translateBatch,
    exportToJson,
    refreshData
  } = useStrongsTranslation();

  const [batchSize, setBatchSize] = useState(100);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTranslations = translations.filter(t => 
    t.strongs_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.portuguese_word.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.portuguese_definition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Carregando léxico...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Languages className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Tradução Strong's</h1>
              <p className="text-muted-foreground">
                Gerenciar traduções do léxico Strong's para português
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={refreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{stats.total.toLocaleString()}</p>
                </div>
                <Languages className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Traduzidas</p>
                  <p className="text-2xl font-bold text-green-600">{stats.translated.toLocaleString()}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pendentes</p>
                  <p className="text-2xl font-bold text-amber-600">{stats.pending.toLocaleString()}</p>
                </div>
                <Clock className="h-8 w-8 text-amber-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Progresso</p>
                  <p className="text-2xl font-bold">{stats.percentage}%</p>
                </div>
                <div className="w-16">
                  <Progress value={stats.percentage} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Overall Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Progresso Geral</CardTitle>
            <CardDescription>
              {stats.translated.toLocaleString()} de {stats.total.toLocaleString()} palavras traduzidas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={stats.percentage} className="h-4 mb-4" />
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-green-600 border-green-600">
                Hebraico (H): ~{Math.round(stats.translated * 0.6).toLocaleString()} traduzidas
              </Badge>
              <Badge variant="outline" className="text-blue-600 border-blue-600">
                Grego (G): ~{Math.round(stats.translated * 0.4).toLocaleString()} traduzidas
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Translation Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Controles de Tradução</CardTitle>
            <CardDescription>
              Inicie a tradução automática usando IA (Lovable AI)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Tamanho do Lote</label>
                <Input
                  type="number"
                  value={batchSize}
                  onChange={(e) => setBatchSize(Number(e.target.value))}
                  min={10}
                  max={500}
                  disabled={isTranslating}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Quantas palavras traduzir por vez (10-500)
                </p>
              </div>
              <div className="flex gap-2 pt-6">
                <Button 
                  onClick={() => translateBatch(batchSize)} 
                  disabled={isTranslating || stats.pending === 0}
                  size="lg"
                >
                  {isTranslating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Traduzindo... {progress}%
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Iniciar Tradução
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={exportToJson}
                  disabled={translations.length === 0}
                  size="lg"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar JSON
                </Button>
              </div>
            </div>

            {isTranslating && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Traduzindo lote...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Translations List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Traduções Concluídas</CardTitle>
                <CardDescription>
                  {translations.length.toLocaleString()} traduções no banco de dados
                </CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar traduções..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {filteredTranslations.slice(0, 100).map((t) => (
                  <div 
                    key={t.strongs_id}
                    className="flex items-start gap-4 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <Badge 
                      variant={t.strongs_id.startsWith('H') ? 'default' : 'secondary'}
                      className="font-mono shrink-0"
                    >
                      {t.strongs_id}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{t.portuguese_word}</span>
                        {t.original_word && (
                          <span className="text-muted-foreground text-sm">
                            ({t.original_word})
                          </span>
                        )}
                        {t.transliteration && (
                          <span className="text-xs text-muted-foreground italic">
                            {t.transliteration}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {t.portuguese_definition}
                      </p>
                      {t.portuguese_usage && (
                        <p className="text-xs text-muted-foreground/70 line-clamp-1 mt-1">
                          Uso: {t.portuguese_usage}
                        </p>
                      )}
                    </div>
                    {t.part_of_speech && (
                      <Badge variant="outline" className="text-xs shrink-0">
                        {t.part_of_speech.split(' ')[0]}
                      </Badge>
                    )}
                  </div>
                ))}

                {filteredTranslations.length > 100 && (
                  <p className="text-center text-sm text-muted-foreground py-4">
                    Mostrando 100 de {filteredTranslations.length.toLocaleString()} resultados
                  </p>
                )}

                {filteredTranslations.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    {searchTerm ? 'Nenhuma tradução encontrada' : 'Nenhuma tradução ainda. Clique em "Iniciar Tradução" para começar.'}
                  </p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
