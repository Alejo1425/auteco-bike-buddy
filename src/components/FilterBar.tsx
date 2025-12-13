import { Button } from "@/components/ui/button";
import { marcas, categorias } from "@/data/motos";

interface FilterBarProps {
  selectedMarca: string | null;
  selectedCategoria: string;
  onMarcaChange: (marca: string | null) => void;
  onCategoriaChange: (categoria: string) => void;
}

export function FilterBar({
  selectedMarca,
  selectedCategoria,
  onMarcaChange,
  onCategoriaChange,
}: FilterBarProps) {
  return (
    <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border py-4 mb-8">
      <div className="container mx-auto px-4">
        {/* Marcas */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-2 font-heading font-medium">Marcas:</p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedMarca === null ? "default" : "outline"}
              size="sm"
              onClick={() => onMarcaChange(null)}
              className="font-heading"
            >
              Todas
            </Button>
            {marcas.map((marca) => (
              <Button
                key={marca}
                variant={selectedMarca === marca ? "default" : "outline"}
                size="sm"
                onClick={() => onMarcaChange(marca)}
                className="font-heading"
              >
                {marca}
              </Button>
            ))}
          </div>
        </div>

        {/* Categorías */}
        <div>
          <p className="text-sm text-muted-foreground mb-2 font-heading font-medium">Categorías:</p>
          <div className="flex flex-wrap gap-2">
            {categorias.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategoria === cat.id ? "default" : "outline"}
                size="sm"
                onClick={() => onCategoriaChange(cat.id)}
                className="font-heading"
              >
                {cat.nombre}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
