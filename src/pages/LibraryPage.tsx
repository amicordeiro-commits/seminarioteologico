import { AppLayout } from "@/components/layout/AppLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Book,
  FileText,
  Video,
  Headphones,
  Download,
  Search,
  BookOpen,
  ScrollText,
  Filter,
  Heart,
  Eye,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { useLibraryMaterials, useLibraryCategories, LibraryMaterial } from "@/hooks/useLibrary";
import { SermonReader } from "@/components/library/SermonReader";

const defaultCategories = [
  "Todos",
  "Bíblias",
  "Comentários",
  "Teologia Sistemática",
  "História da Igreja",
  "Línguas Bíblicas",
  "Devocionais",
  "Sermões",
];

const getTypeIcon = (type: string | null) => {
  switch (type) {
    case "ebook":
    case "pdf":
      return Book;
    case "video":
    case "mp4":
      return Video;
    case "audio":
    case "mp3":
      return Headphones;
    case "document":
    case "docx":
      return FileText;
    default:
      return ScrollText;
  }
};

const getTypeBadgeColor = (type: string | null) => {
  switch (type) {
    case "ebook":
    case "pdf":
      return "bg-primary/10 text-primary";
    case "video":
    case "mp4":
      return "bg-accent/10 text-accent";
    case "audio":
    case "mp3":
      return "bg-secondary/80 text-secondary-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export default function LibraryPage() {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState<LibraryMaterial | null>(null);
  
  const { data: materials = [], isLoading } = useLibraryMaterials(selectedCategory);
  const { data: dbCategories } = useLibraryCategories();

  const categories = dbCategories?.length ? dbCategories : defaultCategories;

  const filteredResources = materials.filter((resource) => {
    const matchesSearch =
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (resource.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const stats = {
    ebooks: materials.filter(m => m.file_type === 'pdf' || m.file_type === 'ebook').length,
    videos: materials.filter(m => m.file_type === 'video' || m.file_type === 'mp4').length,
    audios: materials.filter(m => m.file_type === 'audio' || m.file_type === 'mp3').length,
    documents: materials.filter(m => m.file_type === 'document' || m.file_type === 'docx').length,
  };

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 space-y-8 animate-fade-in">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl lg:text-4xl font-serif font-bold text-foreground">
            Biblioteca Teológica
          </h1>
          <p className="text-muted-foreground">
            Acesse recursos, livros, vídeos e materiais de estudo
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Buscar por título ou descrição..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            Filtros
          </Button>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedCategory === category
                  ? "bg-primary text-primary-foreground shadow-glow"
                  : "bg-card border border-border text-muted-foreground hover:bg-accent"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Book className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.ebooks || 0}</p>
                <p className="text-xs text-muted-foreground">E-books</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Video className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.videos || 0}</p>
                <p className="text-xs text-muted-foreground">Vídeos</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center">
                <Headphones className="w-5 h-5 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.audios || 0}</p>
                <p className="text-xs text-muted-foreground">Áudios</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <FileText className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.documents || 0}</p>
                <p className="text-xs text-muted-foreground">Documentos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Resources Grid */}
        {!isLoading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredResources.map((resource) => {
              const TypeIcon = getTypeIcon(resource.file_type);
              return (
                <div
                  key={resource.id}
                  className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-300 group"
                >
                  {/* Header with type icon */}
                  <div className="p-4 bg-gradient-to-r from-primary/5 to-accent/5 border-b border-border">
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-lg bg-background flex items-center justify-center shadow-sm">
                        <TypeIcon className="w-6 h-6 text-primary" />
                      </div>
                      <button className="text-muted-foreground hover:text-primary transition-colors">
                        <Heart className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-serif font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {resource.title}
                      </h3>
                    </div>

                    {resource.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {resource.description}
                      </p>
                    )}

                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={getTypeBadgeColor(resource.file_type)}>
                        {resource.file_type?.toUpperCase() || "PDF"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {resource.category}
                      </span>
                    </div>

                      <div className="flex items-center justify-between pt-2 border-t border-border">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Download className="w-3 h-3" />
                          <span>{resource.download_count}</span>
                        </div>
                        <div className="flex gap-2">
                          {resource.content && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="h-8 px-3 gap-1"
                              onClick={() => setSelectedMaterial(resource)}
                            >
                              <BookOpen className="w-3 h-3" />
                              Ler
                            </Button>
                          )}
                          {resource.file_url && (
                            <Button 
                              size="sm" 
                              className="h-8 px-3 gap-1"
                              onClick={() => window.open(resource.file_url!, '_blank')}
                            >
                              <Download className="w-3 h-3" />
                              Baixar
                            </Button>
                          )}
                          {!resource.content && !resource.file_url && (
                            <span className="text-xs text-muted-foreground italic">
                              Em breve
                            </span>
                          )}
                        </div>
                      </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredResources.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground">
              Nenhum recurso encontrado
            </h3>
            <p className="text-muted-foreground mt-1">
              Tente ajustar sua busca ou filtros
            </p>
          </div>
        )}

        {/* Sermon Reader Modal */}
        {selectedMaterial && (
          <SermonReader
            open={!!selectedMaterial}
            onOpenChange={(open) => !open && setSelectedMaterial(null)}
            title={selectedMaterial.title}
            content={selectedMaterial.content}
            category={selectedMaterial.category}
          />
        )}
      </div>
    </AppLayout>
  );
}
