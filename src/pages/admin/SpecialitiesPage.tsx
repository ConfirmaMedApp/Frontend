import Container from "@/components/partials/Container";
import {
  Brain,
  Search,
  Filter,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
} from "lucide-react";
import { useState } from "react";
import { useSpecialities } from "@/hooks/useSpecialities";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Speciality } from "@/interfaces/specialitiesInterface";
import { toast } from "sonner";
import SpecialityModal from "@/components/modals/SpecialityModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AddDoctorsBySpecialityModal from "@/components/modals/AddDoctorsBySpecialityModal";

const SpecialitiesPage = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [modalOpenEdit, setModalOpenEdit] = useState<boolean>(false);
  const [modalOpenAddDoctors, setModalOpenAddDoctors] =
    useState<boolean>(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedSpeciality, setSelectedSpeciality] =
    useState<Speciality | null>(null);
  const itemsPerPage = 25;

  // Calcular offset para la paginación
  const offset = (currentPage - 1) * itemsPerPage;

  // Determinar el valor del filtro de estado
  const statusValue =
    statusFilter === "all" ? null : statusFilter === "active" ? true : false;

  // Obtener especialidades con los filtros aplicados
  const { data, isLoading, isError, error, refetch } = useSpecialities({
    limit: itemsPerPage,
    offset: offset,
    search: search || null,
    status: statusValue,
  });

  // Extraer los items de la respuesta de la API
  const specialities = data?.items || [];
  const canGoNext = specialities.length === itemsPerPage; // Si hay items completos, probablemente hay más

  // Handlers
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1); // Resetear a la primera página al buscar
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1); // Resetear a la primera página al cambiar filtro
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  const handleRefetchData = () => {
    refetch();
    toast.success("Actualizando y sincronizando especialidades");
  };

  const handleOpenCreateModal = () => {
    setModalMode("create");
    setSelectedSpeciality(null);
    setModalOpenEdit(true);
  };

  const handleOpenEditModal = (speciality: Speciality) => {
    setModalMode("edit");
    setSelectedSpeciality(speciality);
    setModalOpenEdit(true);
  };

  const handleOpenAddDoctorsModal = (speciality: Speciality) => {
    setSelectedSpeciality(speciality);
    setModalOpenAddDoctors(true);
  };

  return (
    <>
      <Container
        titleModule="Gestión de especialidades"
        description="Administra las especialidades médicas disponibles en el sistema"
        icon={<Brain size={30} />}
        onRetryData={handleRefetchData}
        titleButton="Agregar especialidad"
        onClickButton={handleOpenCreateModal}
      >
        {/* Filtros */}
        <Card className="p-4 mb-4 w-full">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Buscador */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, código o descripción..."
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Filtro de estado */}
            <div className="w-full sm:w-fit">
              <Select value={statusFilter} onValueChange={handleStatusChange}>
                <SelectTrigger className="">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="active">Activos</SelectItem>
                  <SelectItem value="inactive">Inactivos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Tabla */}
        <Card className="py-2 gap-0 px-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead className="w-[100px]">Estado</TableHead>
                <TableHead className="w-[100px] text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Skeleton mientras carga
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-40" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-60" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-20 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : isError ? (
                // Error
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    <p className="text-sm text-destructive font-semibold">
                      {(error as Error)?.message ||
                        "Ocurrió un error inesperado"}
                    </p>
                  </TableCell>
                </TableRow>
              ) : !data || specialities.length === 0 ? (
                // Sin resultados
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    <div className="text-muted-foreground">
                      No se encontraron especialidades
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Intenta ajustar los filtros de búsqueda
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                // Datos
                specialities.map((speciality: Speciality) => (
                  <TableRow key={speciality.id}>
                    <TableCell>
                      <code className="bg-muted px-2 py-1 rounded text-xs">
                        {speciality.code}
                      </code>
                    </TableCell>
                    <TableCell className="font-medium">
                      {speciality.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-72 truncate">
                      {speciality.description || "Sin descripción"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={speciality.status ? "success" : "destructive"}
                      >
                        {speciality.status ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleOpenEditModal(speciality)}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="1.3em"
                              height="1.3em"
                              viewBox="0 0 24 24"
                            >
                              <path
                                fill="none"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 20h4L18.5 9.5a2.828 2.828 0 1 0-4-4L4 16zm9.5-13.5l4 4m-.499 8.5a2 2 0 1 0 4 0a2 2 0 1 0-4 0m2-3.5V17m0 4v1.5m3.031-5.25l-1.299.75m-3.463 2l-1.3.75m0-3.5l1.3.75m3.463 2l1.3.75"
                              />
                            </svg>
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleOpenAddDoctorsModal(speciality)
                            }
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="1.3em"
                              height="1.3em"
                              viewBox="0 0 14 14"
                            >
                              <path
                                fill="none"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5.031 5.531a2.5 2.5 0 1 0 0-5a2.5 2.5 0 0 0 0 5m4.407 1.5a.5.5 0 0 0-.5.5v1.407H7.53a.5.5 0 0 0-.5.5v1.625a.5.5 0 0 0 .5.5h1.407v1.406a.5.5 0 0 0 .5.5h1.624a.5.5 0 0 0 .5-.5v-1.406h1.407a.5.5 0 0 0 .5-.5V9.438a.5.5 0 0 0-.5-.5h-1.406V7.53a.5.5 0 0 0-.5-.5zm-3.91 5.5H.531v-.542a4.51 4.51 0 0 1 5.116-4.422"
                              />
                            </svg>
                            Agregar doctores
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Paginación */}
          <div className="flex items-center justify-between px-4 py-4 border-t">
            <div className="text-sm text-muted-foreground">
              Página {currentPage}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
              >
                <ChevronsLeft />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNextPage}
                disabled={!canGoNext || isLoading}
              >
                <ChevronsRight />
              </Button>
            </div>
          </div>
        </Card>
      </Container>

      {/* Modal para crear/editar especialidad */}
      <SpecialityModal
        open={modalOpenEdit}
        onOpenChange={setModalOpenEdit}
        speciality={selectedSpeciality}
        mode={modalMode}
      />
      <AddDoctorsBySpecialityModal
        open={modalOpenAddDoctors}
        onOpenChange={setModalOpenAddDoctors}
        specialityId={selectedSpeciality ? selectedSpeciality.id : 0}
      />
    </>
  );
};

export default SpecialitiesPage;
