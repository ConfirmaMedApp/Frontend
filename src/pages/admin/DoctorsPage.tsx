import Container from "@/components/partials/Container";
import {
  Stethoscope,
  Search,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  Brain,
  FileUser,
} from "lucide-react";
import { useState } from "react";
import { useDoctors } from "@/hooks/useDoctors";
import {
  useDoctorsBySpeciality,
  useSpecialities,
} from "@/hooks/useSpecialities";
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
import type { Speciality } from "@/interfaces/specialitiesInterface";
import { toast } from "sonner";
import DoctorModal from "@/components/modals/DoctorModal";
import DoctorProfileModal from "@/components/modals/DoctorProfileModal";
import DoctorAvatar from "@/components/custom/DoctorAvatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Badge } from "@/components/ui/badge";

const DoctorsPage = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [specialityFilter, setSpecialityFilter] = useState<string>("all");
  const [specialitySearch, setSpecialitySearch] = useState<string>("");
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [profileOpen, setProfileOpen] = useState<boolean>(false);
  const [profileDoctor, setProfileDoctor] = useState<Doctor | null>(null);
  const itemsPerPage = 25;

  // Calcular offset para la paginación
  const offset = (currentPage - 1) * itemsPerPage;

  const statusValue =
    statusFilter === "all" ? null : statusFilter === "active" ? true : false;

  const specialityId = specialityFilter === "all" ? 0 : Number(specialityFilter);
  const filterBySpeciality = specialityId !== 0;

  // Opciones del filtro por especialidad (la búsqueda se hace en el servidor)
  const { data: specialitiesData, isFetching: fetchingSpecialities } =
    useSpecialities({
      limit: null,
      offset: null,
      search: specialitySearch || null,
      status: true,
    });

  // Listado general (paginado en el servidor): solo se consulta sin filtro de especialidad
  const doctorsQuery = useDoctors({
    limit: itemsPerPage,
    offset: offset,
    search: search || null,
    status: statusValue,
    enabled: !filterBySpeciality,
  });

  // Doctores de la especialidad elegida (con descripción y foto): el endpoint solo
  // filtra por texto, así que el estado y la paginación se aplican abajo en el cliente
  const specialityQuery = useDoctorsBySpeciality(specialityId, search || null);

  const { data, isLoading, isError, error, refetch } = filterBySpeciality
    ? specialityQuery
    : doctorsQuery;

  // Extraer los items de la respuesta de la API
  const items: Doctor[] = Array.isArray(data?.items) ? data.items : [];
  let doctors: Doctor[];
  let canGoNext: boolean;
  if (filterBySpeciality) {
    const filtered = items.filter(
      (doctor) => statusValue === null || doctor.status === statusValue
    );
    doctors = filtered.slice(offset, offset + itemsPerPage);
    canGoNext = offset + itemsPerPage < filtered.length;
  } else {
    doctors = items;
    canGoNext = doctors.length === itemsPerPage; // Si hay items completos, probablemente hay más
  }

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

  const handleSpecialityChange = (value: string) => {
    setSpecialityFilter(value);
    setCurrentPage(1); // Resetear a la primera página al cambiar filtro
  };

  const handleOpenEditModal = (doctor: Doctor) => {
    setModalMode("edit");
    setSelectedDoctor(doctor);
    setModalOpen(true);
  };

  const handleOpenProfileModal = (doctor: Doctor) => {
    setProfileDoctor(doctor);
    setProfileOpen(true);
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
            {/* Filtro por especialidad */}
            <div className="w-full sm:w-64">
              <SearchableSelect
                options={[
                  {
                    value: "all",
                    label: "Todas las especialidades",
                    localFilter: true,
                  },
                  ...(specialitiesData?.items?.map(
                    (speciality: Speciality) => ({
                      value: speciality.id.toString(),
                      label: speciality.name,
                    })
                  ) ?? []),
                ]}
                value={specialityFilter}
                onValueChange={handleSpecialityChange}
                onSearchChange={setSpecialitySearch}
                loading={fetchingSpecialities}
                icon={<Brain className="h-4 w-4" />}
                placeholder="Especialidad"
                searchPlaceholder="Buscar especialidad..."
                emptyText="No se encontraron especialidades."
              />
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
                <TableHead className="w-[220px] text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Skeleton mientras carga
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="size-9 rounded-full" />
                        <Skeleton className="h-4 w-24" />
                      </div>
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
                      <Skeleton className="h-5 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-20 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : isError ? (
                // Error
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    <p className="text-sm text-destructive font-semibold">
                      {(error as Error)?.message ||
                        "Ocurrió un error inesperado"}
                    </p>
                  </TableCell>
                </TableRow>
              ) : !data || doctors.length === 0 ? (
                // Sin resultados
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
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
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <DoctorAvatar
                          src={doctor.photoUrl}
                          name={doctor.name}
                          lastName={doctor.lastName}
                          className="size-9"
                        />
                        <span>{doctor.name}</span>
                      </div>
                    </TableCell>
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
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenProfileModal(doctor)}
                        >
                          <FileUser />
                          Hoja de vida
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEditModal(doctor)}
                        >
                          Editar
                        </Button>
                      </div>
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

      {/* Modal con la hoja de vida del doctor */}
      <DoctorProfileModal
        open={profileOpen}
        onOpenChange={setProfileOpen}
        doctor={profileDoctor}
      />
    </>
  );
};

export default DoctorsPage;
