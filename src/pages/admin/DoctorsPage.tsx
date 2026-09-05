import Container from "@/components/partials/Container";
import {
  Stethoscope,
  Search,
  ChevronsLeft,
  ChevronsRight,
  Filter,
} from "lucide-react";
import { useState } from "react";
import { useDoctors } from "@/hooks/useDoctors";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Doctor } from "@/interfaces/doctorsInterface";
import { toast } from "sonner";
import DoctorModal from "@/components/modals/DoctorModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const DoctorsPage = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const itemsPerPage = 25;

  // Calcular offset para la paginación
  const offset = (currentPage - 1) * itemsPerPage;

  const statusValue =
    statusFilter === "all" ? null : statusFilter === "active" ? true : false;

  // Obtener doctores con los filtros aplicados
  const { data, isLoading, isError, error, refetch } = useDoctors({
    limit: itemsPerPage,
    offset: offset,
    search: search || null,
    status: statusValue,
  });

  // Extraer los items de la respuesta de la API
  const doctors = data?.items || [];
  const canGoNext = doctors.length === itemsPerPage; // Si hay items completos, probablemente hay más

  // Handlers
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
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
    toast.success("Actualizando y sincronizando doctores");
  };

  const handleOpenCreateModal = () => {
    setModalMode("create");
    setSelectedDoctor(null);
    setModalOpen(true);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1); // Resetear a la primera página al cambiar filtro
  };

  const handleOpenEditModal = (doctor: Doctor) => {
    setModalMode("edit");
    setSelectedDoctor(doctor);
    setModalOpen(true);
  };

  return (
    <>
      <Container
        titleModule="Gestión de doctores"
        description="Administra los médicos registrados en el sistema"
        icon={<Stethoscope size={30} />}
        onRetryData={handleRefetchData}
        titleButton="Agregar doctor"
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
                  placeholder="Buscar por nombre, apellido, documento o email..."
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
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
                <TableHead>Nombre</TableHead>
                <TableHead>Apellido</TableHead>
                <TableHead>Tipo Doc.</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Email</TableHead>
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
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-28" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-40" />
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
              ) : !data || doctors.length === 0 ? (
                // Sin resultados
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    <div className="text-muted-foreground">
                      No se encontraron doctores
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Intenta ajustar los filtros de búsqueda
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                // Datos
                doctors.map((doctor: Doctor) => (
                  <TableRow key={doctor.id}>
                    <TableCell className="font-medium">{doctor.name}</TableCell>
                    <TableCell className="font-medium">
                      {doctor.lastName}
                    </TableCell>
                    <TableCell>
                      <code className="bg-muted px-2 py-1 rounded text-xs">
                        {doctor.documentType.name}
                      </code>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {doctor.document}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {doctor.email}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={doctor.status ? "success" : "destructive"}
                      >
                        {doctor.status ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEditModal(doctor)}
                      >
                        Editar
                      </Button>
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

      {/* Modal para crear/editar doctor */}
      <DoctorModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        doctor={selectedDoctor}
        mode={modalMode}
      />
    </>
  );
};

export default DoctorsPage;
