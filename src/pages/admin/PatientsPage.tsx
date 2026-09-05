import Container from "@/components/partials/Container";
import {
  Users,
  Search,
  ChevronsLeft,
  ChevronsRight,
  Filter,
} from "lucide-react";
import { useState } from "react";
import { usePatients } from "@/hooks/usePatients";
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
import type { Patient } from "@/interfaces/patientsInterface";
import { toast } from "sonner";
import PatientModal from "@/components/modals/PatientModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PatientsPage = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const itemsPerPage = 25;

  // Calcular offset para la paginación
  const offset = (currentPage - 1) * itemsPerPage;

  const statusValue =
    statusFilter === "all" ? null : statusFilter === "active" ? true : false;

  // Obtener pacientes con los filtros aplicados
  const { data, isLoading, isError, error, refetch } = usePatients({
    limit: itemsPerPage,
    offset: offset,
    search: search || null,
    status: statusValue,
  });

  // Extraer los items de la respuesta de la API
  const patients = data?.items || [];
  const canGoNext = patients.length === itemsPerPage; // Si hay items completos, probablemente hay más

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
    toast.success("Actualizando y sincronizando pacientes");
  };

  const handleOpenCreateModal = () => {
    setModalMode("create");
    setSelectedPatient(null);
    setModalOpen(true);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1); // Resetear a la primera página al cambiar filtro
  };

  const handleOpenEditModal = (patient: Patient) => {
    setModalMode("edit");
    setSelectedPatient(patient);
    setModalOpen(true);
  };

  // Función para calcular edad
  const calculateAge = (birthdate: string) => {
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <>
      <Container
        titleModule="Gestión de pacientes"
        description="Administra los pacientes registrados en el sistema"
        icon={<Users size={30} />}
        onRetryData={handleRefetchData}
        titleButton="Agregar paciente"
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
                <TableHead>Documento</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Edad</TableHead>
                <TableHead>Género</TableHead>
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
                      <Skeleton className="h-4 w-28" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-40" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-28" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-20 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : isError ? (
                // Error
                <TableRow>
                  <TableCell colSpan={9} className="text-center">
                    <p className="text-sm text-destructive font-semibold">
                      {(error as Error)?.message || "Ocurrió un error inesperado"}
                    </p>
                  </TableCell>
                </TableRow>
              ) : !data || patients.length === 0 ? (
                // Sin resultados
                <TableRow>
                  <TableCell colSpan={9} className="text-center">
                    <div className="text-muted-foreground">
                      No se encontraron pacientes
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Intenta ajustar los filtros de búsqueda
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                // Datos
                patients.map((patient: Patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">{patient.name}</TableCell>
                    <TableCell className="font-medium">
                      {patient.lastname}
                    </TableCell>
                    <TableCell>
                      <code className="bg-muted px-2 py-1 rounded text-xs">
                        {patient.documentType.name}: {patient.document}
                      </code>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {patient.email}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {patient.phone}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {calculateAge(patient.birthdate)} años
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {patient.gender.name}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEditModal(patient)}
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

      {/* Modal para crear/editar paciente */}
      <PatientModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        patient={selectedPatient}
        mode={modalMode}
      />
    </>
  );
};

export default PatientsPage;
