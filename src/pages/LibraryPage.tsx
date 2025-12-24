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
} from "lucide-react";
import { useState } from "react";

const categories = [
  "Todos",
  "Bíblias",
  "Comentários",
  "Teologia Sistemática",
  "História da Igreja",
  "Línguas Bíblicas",
  "Devocionais",
  "Sermões",
];

const resources = [
  {
    id: 1,
    title: "Bíblia de Estudo Almeida",
    author: "João Ferreira de Almeida",
    type: "ebook",
    category: "Bíblias",
    format: "PDF",
    size: "45 MB",
    downloads: 1234,
    isFavorite: true,
    description: "Bíblia completa com notas de estudo e referências cruzadas.",
  },
  {
    id: 2,
    title: "Institutas da Religião Cristã",
    author: "João Calvino",
    type: "ebook",
    category: "Teologia Sistemática",
    format: "PDF",
    size: "12 MB",
    downloads: 856,
    isFavorite: false,
    description: "Obra magna da teologia reformada.",
  },
  {
    id: 3,
    title: "Comentário Bíblico de Mateus",
    author: "William Hendriksen",
    type: "ebook",
    category: "Comentários",
    format: "EPUB",
    size: "8 MB",
    downloads: 543,
    isFavorite: true,
    description: "Comentário expositivo completo do Evangelho de Mateus.",
  },
  {
    id: 4,
    title: "Aula: Introdução ao Grego Koiné",
    author: "Dr. Roberto Silva",
    type: "video",
    category: "Línguas Bíblicas",
    format: "MP4",
    size: "1.2 GB",
    downloads: 321,
    isFavorite: false,
    description: "Série de aulas em vídeo sobre o grego do Novo Testamento.",
  },
  {
    id: 5,
    title: "História do Cristianismo Vol. 1",
    author: "Justo González",
    type: "audio",
    category: "História da Igreja",
    format: "MP3",
    size: "890 MB",
    downloads: 678,
    isFavorite: false,
    description: "Audiobook completo sobre a história da igreja primitiva.",
  },
  {
    id: 6,
    title: "Mananciais no Deserto",
    author: "Mrs. Charles E. Cowman",
    type: "ebook",
    category: "Devocionais",
    format: "PDF",
    size: "5 MB",
    downloads: 1567,
    isFavorite: true,
    description: "Devocional clássico para meditação diária.",
  },
  {
    id: 7,
    title: "Sermões de Spurgeon",
    author: "Charles Spurgeon",
    type: "document",
    category: "Sermões",
    format: "PDF",
    size: "15 MB",
    downloads: 923,
    isFavorite: false,
    description: "Coletânea dos melhores sermões do príncipe dos pregadores.",
  },
  {
    id: 8,
    title: "Gramática Hebraica",
    author: "Thomas Lambdin",
    type: "ebook",
    category: "Línguas Bíblicas",
    format: "PDF",
    size: "22 MB",
    downloads: 445,
    isFavorite: false,
    description: "Manual completo de hebraico bíblico para estudantes.",
  },
];

const getTypeIcon = (type: string) => {
  switch (type) {
    case "ebook":
      return Book;
    case "video":
      return Video;
    case "audio":
      return Headphones;
    case "document":
      return FileText;
    default:
      return ScrollText;
  }
};

const getTypeBadgeColor = (type: string) => {
  switch (type) {
    case "ebook":
      return "bg-primary/10 text-primary";
    case "video":
      return "bg-accent/10 text-accent";
    case "audio":
      return "bg-secondary/80 text-secondary-foreground";
    case "document":
      return "bg-muted text-muted-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export default function LibraryPage() {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredResources = resources.filter((resource) => {
    const matchesCategory =
      selectedCategory === "Todos" || resource.category === selectedCategory;
    const matchesSearch =
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
              placeholder="Buscar por título ou autor..."
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
                <p className="text-2xl font-bold text-foreground">248</p>
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
                <p className="text-2xl font-bold text-foreground">86</p>
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
                <p className="text-2xl font-bold text-foreground">42</p>
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
                <p className="text-2xl font-bold text-foreground">124</p>
                <p className="text-xs text-muted-foreground">Documentos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredResources.map((resource) => {
            const TypeIcon = getTypeIcon(resource.type);
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
                      <Heart
                        className={`w-5 h-5 ${
                          resource.isFavorite ? "fill-primary text-primary" : ""
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-serif font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {resource.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {resource.author}
                    </p>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {resource.description}
                  </p>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={getTypeBadgeColor(resource.type)}>
                      {resource.format}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {resource.size}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Download className="w-3 h-3" />
                      <span>{resource.downloads}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" className="h-8 px-2">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" className="h-8 px-3 gap-1">
                        <Download className="w-3 h-3" />
                        Baixar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredResources.length === 0 && (
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
      </div>
    </AppLayout>
  );
}
