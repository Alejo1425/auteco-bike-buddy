import { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { FilterBar } from "@/components/FilterBar";
import { MotoCard } from "@/components/MotoCard";
import { Footer } from "@/components/Footer";
import { motos, type Moto } from "@/data/motos";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMarca, setSelectedMarca] = useState<string | null>(null);
  const [selectedCategoria, setSelectedCategoria] = useState("todas");

  const filteredMotos = useMemo(() => {
    return motos.filter((moto) => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        moto.modelo.toLowerCase().includes(searchLower) ||
        moto.marca.toLowerCase().includes(searchLower) ||
        (moto.cilindrada && moto.cilindrada.toLowerCase().includes(searchLower));

      // Marca filter
      const matchesMarca = selectedMarca === null || moto.marca === selectedMarca;

      // Categoria filter
      const matchesCategoria = 
        selectedCategoria === "todas" || moto.categoria === selectedCategoria;

      return matchesSearch && matchesMarca && matchesCategoria;
    });
  }, [searchQuery, selectedMarca, selectedCategoria]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        <Hero 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          totalMotos={motos.length}
        />
        
        <FilterBar
          selectedMarca={selectedMarca}
          selectedCategoria={selectedCategoria}
          onMarcaChange={setSelectedMarca}
          onCategoriaChange={setSelectedCategoria}
        />
        
        <section className="container mx-auto px-4 pb-16">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-heading font-bold text-2xl text-foreground">
              {filteredMotos.length} {filteredMotos.length === 1 ? 'moto encontrada' : 'motos encontradas'}
            </h3>
          </div>
          
          {filteredMotos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredMotos.map((moto, index) => (
                <MotoCard key={moto.id} moto={moto} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg font-body">
                No se encontraron motos con los filtros seleccionados.
              </p>
            </div>
          )}
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
