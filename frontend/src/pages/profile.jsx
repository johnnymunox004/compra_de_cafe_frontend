import React, { useEffect, useState } from "react";
import useAspirantesStore from "../store/useAspirantesStore";
import { Modal, Button, Label, TextInput } from "flowbite-react";
import NavLinks from "../components/navLinks";
import { CSVLink } from "react-csv";
import GeneradorPDF from "../components/GeneradorPDF";
import LoadingSpinner from "../components/loadingSpinner";


function Profile() {
  const {
    aspirantes,
    fetchAspirantes,
    loading,
    error,
    createAspirante,
    updateAspirante,
    deleteAspirante,
  } = useAspirantesStore();

  const [searchTerm, setSearchTerm] = useState(""); // Corregido

  const [selectedWeek, setSelectedWeek] = useState(""); // Nuevo estado
  const [selectedMonth, setSelectedMonth] = useState(null); // Cambiado a objeto de fecha
  const [selectedDate, setSelectedDate] = useState(null); // Para filtro por día

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    identificacion: "",
    tipo_cafe: "",
    peso: "",
    precio: "",
    precio_total: "",
    telefono: "",
    estado: "",
    estado_monetario: "",
    date_create: "",
  });
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const handleDateChange = (e) => setSelectedDate(e.target.value);

  const handleWeekChange = (e) => setSelectedWeek(e.target.value);

  const handleMonthChange = (e) => setSelectedMonth(e.target.value);

  useEffect(() => {
    fetchAspirantes(); // Llamada para obtener los aspirantes
  }, [fetchAspirantes]);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const formattedValue = name === "precio" ? String(value) : value; // Convertir a cadena si es precio
    setFormData({ ...formData, [name]: formattedValue });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Asegurarse de que precio sea una cadena antes de aplicar replace
    const formattedData = {
      ...formData,
      precio:
        typeof formData.precio === "string"
          ? Number(formData.precio.replace(/\D/g, ""))
          : formData.precio, // Si ya es un número, lo mantenemos como está
    };

    if (editMode) {
      updateAspirante(currentId, formattedData).then(() => {
        window.location.reload(); // Actualizar la página después de la actualización
      });
    } else {
      createAspirante(formattedData).then(() => {
        window.location.reload(); // Actualizar la página después de crear un nuevo aspirante
      });
    }

    // Resetear el formulario
    setShowModal(false);
    setFormData({
      nombre: "",
      identificacion: "",
      tipo_cafe: "",
      peso: "",
      precio: "",
      precio_total: "",
      telefono: "",
      estado: "",
      estado_monetario: "",
      date_create: "",
    });
    setEditMode(false);
  };

  const handleEdit = (aspirante) => {
    setCurrentId(aspirante._id);
    setFormData(aspirante);
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async () => {
    await deleteAspirante(deleteId);
    setShowDeleteModal(false);
    setDeleteId(null);
  };

  if (loading)
    return (
      <div>
        <LoadingSpinner />
      </div>
    );
  if (error)
    return (
      <div>
        <div
          style={{
            backgroundColor: "red",
            color: "white",
            padding: "10px",
            borderRadius: "5px",
            margin: "10px 0",
          }}
        >
          {error}
        </div>
      </div>
    );

  // Convertir los datos de los aspirantes en formato CSV
  const csvData = aspirantes.map((aspirante) => ({
    Nombre: aspirante.nombre,
    Identificación: aspirante.identificacion,
    Tipo_Cafe: aspirante.tipo_cafe,
    Peso: aspirante.peso,
    Precio: aspirante.precio,
    Precio_total: aspirante.precio_total,

    Teléfono: aspirante.telefono,
    Estado: aspirante.estado,
    Estado_monetario: aspirante.estado_monetario,
    Fecha: aspirante.date_create,
  }));

  // filtrossssssssssssssssssssssssssssssss
  const getISOWeekNumber = (date) => {
    const tempDate = new Date(date);
    tempDate.setUTCDate(
      tempDate.getUTCDate() + 4 - (tempDate.getUTCDay() || 7)
    );
    const yearStart = new Date(Date.UTC(tempDate.getUTCFullYear(), 0, 1));
    const weekNumber = Math.ceil(((tempDate - yearStart) / 86400000 + 1) / 7);
    return { year: tempDate.getUTCFullYear(), week: weekNumber };
  };

  const filterAspirantes = () => {
    return aspirantes.filter((aspirante) => {
      const creationDate = new Date(aspirante.date_create);

      // Filtrar por fecha exacta
      if (selectedDate) {
        return (
          creationDate.toISOString().split("T")[0] ===
          selectedDate.toISOString().split("T")[0]
        );
      }

      // Filtrar por mes
      if (selectedMonth) {
        return (
          creationDate.getFullYear() === selectedMonth.getFullYear() &&
          creationDate.getMonth() === selectedMonth.getMonth()
        );
      }

      // Si no hay filtro, mostrar todos
      return true;
    });
  };

  // filtrossssssssssssssssssssssssssssssss

  return (
    <div className="aside-dashboard flex">
      <div>
        <NavLinks />
      </div>
      <div className="main-dashboard">
        <div className="p-8">
          <h1 className="text-2xl font-bold mt-6 mb-4">base de datos</h1>
          <div className="flex gap-4 mb-4">
            <div>
              <Label htmlFor="search" value="Buscar" />
              <TextInput
                id="search"
                placeholder="Buscar por nombre o identificación"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>

         
          </div>

          <CSVLink
            data={csvData}
            filename={"aspirantes.csv"}
            className="mb-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            target="_blank"
          >
            Descargar CSV
          </CSVLink>

          {/* Tabla de aspirantes */}
          <div className="overflow-y-auto max-h-96 mt-4">
            {" "}
            {/* Contenedor con scrollbar */}
            <table className="tablita min-w-full bg-white border border-gray-300">
              <thead>
                <tr>
                  <th className="px-4 py-2 border">Nombre</th>
                  <th className="px-4 py-2 border">Identificación</th>
                  <th className="px-4 py-2 border">Teléfono</th>

                  <th className="px-4 py-2 border">Tipo de Café</th>
                  <th className="px-4 py-2 border">Peso</th>
                  <th className="px-4 py-2 border">Precio</th>
                  <th className="px-4 py-2 border">Precio_total</th>

                  <th className="px-4 py-2 border">Estado</th>
                  <th className="px-4 py-2 border">Estado_mon</th>

                  <th className="px-4 py-2 border">Fecha</th>
                  <th className="px-4 py-2 border">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredAspirantes.map((aspirante) => (
                  <tr key={aspirante._id}>
                    <td className="px-4 py-2 border">{aspirante.nombre}</td>
                    <td className="px-4 py-2 border">
                      {aspirante.identificacion}
                    </td>
                    <td className="px-4 py-2 border">{aspirante.telefono}</td>

                    <td className="px-4 py-2 border">{aspirante.tipo_cafe}</td>
                    <td className="px-4 py-2 border">{aspirante.peso}g</td>
                    <td className="px-4 py-2 border">${aspirante.precio} </td>
                    <td className="px-4 py-2 border">
                      ${aspirante.precio_total}{" "}
                    </td>

                    <td className="px-4 py-2 border">{aspirante.estado}</td>
                    <td className="px-4 py-2 border">
                      {aspirante.estado_monetario}
                    </td>

                    <td className="px-4 py-2 border">
                      {new Date(aspirante.date_create).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 border flex gap-5">
                      <Button
                        onClick={() => handleEdit(aspirante)}
                        className="mr-2"
                        color="warning"
                      >
                        Editar
                      </Button>
                      <GeneradorPDF
                        id={aspirante._id}
                        nombre={aspirante.nombre}
                        telefono={aspirante.telefono}
                        tipo_cafe={aspirante.tipo_cafe}
                        peso={aspirante.peso}
                        precio={aspirante.precio}
                        estado={aspirante.estado}
                        estado_monetario={aspirante.estado_monetario}
                        date_create={aspirante.date_create}
                      />
                      <Button
                        onClick={() => {
                          setDeleteId(aspirante._id);
                          setShowDeleteModal(true);
                        }}
                        color="failure"
                      >
                        Eliminar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal para agregar y editar aspirantes */}
        <Modal show={showModal} onClose={() => setShowModal(false)}>
          <Modal.Header>
            {editMode ? "Editar Aspirante" : "Agregar Aspirante"}
          </Modal.Header>
          <Modal.Body>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <Label htmlFor="nombre" value="Nombre" />
                <TextInput
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="mb-4">
                <Label htmlFor="identificacion" value="Identificación" />
                <TextInput
                  id="identificacion"
                  name="identificacion"
                  value={formData.identificacion}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="mb-4">
                <Label htmlFor="tipo_cafe" value="" />
                <select
                  id="tipo_cafe"
                  name="tipo_cafe"
                  value={formData.tipo_cafe}
                  onChange={handleInputChange}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                  required
                >
                  <option value="">Selecciona un tipo de café</option>
                  <option value="Caturra">Caturra</option>
                  <option value="seco">seco</option>

                  <option value="Variedad Colombia">Variedad Colombia</option>
                  <option value="F6">F6</option>
                  <option value="Borboun Rosado">Borboun Rosado</option>
                  <option value="Geishar">Geishar</option>
                  <option value="Tabi">Tabi</option>
                  <option value="Variedad Castillo">Variedad Castillo</option>
                </select>
              </div>
              <div className="mb-4">
                <Label htmlFor="peso" value="Peso" />
                <TextInput
                  id="peso"
                  name="peso"
                  type="number"
                  value={formData.peso}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="mb-4">
                <Label htmlFor="precio" value="Precio (COP)" />
                <TextInput
                  id="precio"
                  type="text"
                  name="precio"
                  value={formData.precio}
                  onChange={handleInputChange} // Formateo aplicado aquí
                  required
                />
              </div>
              <div className="mb-4">
                <Label htmlFor="telefono" value="Teléfono" />
                <TextInput
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="mb-4">
                <Label htmlFor="estado" />
                <select
                  id="estado"
                  name="estado"
                  value={formData.estado}
                  onChange={handleInputChange}
                  required
                  className="form-select"
                >
                  <option value="" disabled>
                    Selecciona una opción
                  </option>
                  <option value="compra">Compra</option>
                  <option value="venta">Venta</option>
                </select>
              </div>
              <div className="mb-4">
                <select
                  id="estado_monetario"
                  name="estado_monetario"
                  value={formData.estado_monetario}
                  onChange={handleInputChange}
                  required
                  className="form-select"
                >
                  <option value="" disabled>
                    Selecciona una opción
                  </option>
                  <option value="pagado">Pagado</option>
                  <option value="pendiente">Pendiente</option>
                </select>
              </div>

              <Button type="submit" className=" botones_de">
                {editMode ? "Actualizar" : "Agregar"}
              </Button>
            </form>
          </Modal.Body>
        </Modal>

        {/* Modal de confirmación para eliminar */}
        <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
          <Modal.Header>Confirmar Eliminación</Modal.Header>
          <Modal.Body>
            <p>¿Estás seguro de que deseas eliminar este aspirante?</p>
          </Modal.Body>
          <Modal.Footer>
            <Button color="failure" onClick={handleDelete}>
              Eliminar
            </Button>
            <Button onClick={() => setShowDeleteModal(false)}>Cancelar</Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}

export default Profile;
