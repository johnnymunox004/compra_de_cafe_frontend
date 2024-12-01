import React, { useEffect, useState } from "react";
import NavLinks from '../components/navLinks';
import useAspirantesStore from "../store/useAspirantesStore";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Dashboard() {
  const {
    fetchAspirantes,
    aspirantes,
    loading,
    error,
  } = useAspirantesStore();

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(value);
  };

  // Estados para resumen semanal
  const [weeklySummary, setWeeklySummary] = useState({
    totalCompra: 0,
    totalVenta: 0,
    totalGramos: 0,
    tiposCafe: {}
  });

  // Estados para selector de semana
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedWeekOfMonth, setSelectedWeekOfMonth] = useState(5);

  // Estado para la gráfica
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Gramos por Tipo de Café',
        data: [],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  });

  // Función para obtener rango de fechas de una semana específica
  const getWeekDateRange = (year, month, weekOfMonth) => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    // Calcular inicio de la semana
    const startDate = new Date(year, month, 1 + (weekOfMonth - 1) * 7);
    
    // Ajustar si cae antes del primer día del mes
    while (startDate.getMonth() !== month) {
      startDate.setDate(startDate.getDate() + 1);
    }
    
    // Calcular fecha final
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    
    // Asegurar que no se exceda del último día del mes
    if (endDate > lastDayOfMonth) {
      endDate.setDate(lastDayOfMonth.getDate());
    }
    
    return { 
      start: startDate, 
      end: endDate 
    };
  };

  // Filtrar aspirantes por semana
  const filterAspirantesByWeek = (aspirantesArray, year, month, weekOfMonth) => {
    const { start, end } = getWeekDateRange(year, month, weekOfMonth);
    
    return aspirantesArray.filter(aspirante => {
      // Parsear fecha del aspirante
      const fechaAspirante = new Date(aspirante.fecha);
      
      // Verificar si la fecha es válida y está dentro del rango de la semana
      return !isNaN(fechaAspirante.getTime()) && 
             fechaAspirante >= start && 
             fechaAspirante <= end;
    });
  };

  // Preparar datos cuando cambian los aspirantes o la semana seleccionada
  useEffect(() => {
    if (aspirantes.length > 0) {
      // Filtrar aspirantes de la semana seleccionada
      const filteredAspirantes = filterAspirantesByWeek(
        aspirantes, 
        selectedYear, 
        selectedMonth, 
        selectedWeekOfMonth
      );

      // Calcular resumen semanal
      const summary = {
        totalCompra: 0,
        totalVenta: 0,
        totalGramos: 0,
        tiposCafe: {}
      };

      // Tipos de café predefinidos
      const coffeeTypes = [
        'seco', 'Caturra', 'Variedad Colombia', 'F6', 
        'Borboun Rosado', 'Geishar', 'Tabi', 'Variedad Castillo'
      ];

      // Inicializar tipos de café en 0
      coffeeTypes.forEach(type => {
        summary.tiposCafe[type] = 0;
      });

      // Procesar cada aspirante filtrado
      filteredAspirantes.forEach(aspirante => {
        const peso = parseFloat(aspirante.peso) || 0;
        const precio = parseFloat(aspirante.precio) || 0;

        if (aspirante.estado === 'compra') {
          summary.totalCompra += precio;
          summary.totalGramos += peso;
          
          // Acumular gramos por tipo de café
          if (summary.tiposCafe.hasOwnProperty(aspirante.tipo_cafe)) {
            summary.tiposCafe[aspirante.tipo_cafe] += peso;
          }
        } else if (aspirante.estado === 'venta') {
          summary.totalVenta += precio;
          summary.totalGramos -= peso;
        }
      });

      // Actualizar estado con el resumen
      setWeeklySummary(summary);

      // Preparar datos para la gráfica
      const chartLabels = Object.keys(summary.tiposCafe);
      const chartData = Object.values(summary.tiposCafe);

      setChartData({
        labels: chartLabels,
        datasets: [{
          label: 'Gramos por Tipo de Café',
          data: chartData,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
        }],
      });
    }
  }, [aspirantes, selectedYear, selectedMonth, selectedWeekOfMonth]);

  // Años disponibles
  const years = Array.from(
    { length: new Date().getFullYear() - 2020 + 1 }, 
    (_, i) => 2020 + i
  );

  // Meses en español
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Semanas disponibles
  const weeks = [1, 2, 3, 4, 5];

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="aside-dashboard">
      <div>
        <NavLinks />
      </div>

      <div className="main-dashboard">
        <h1 className="font-bold text-3xl">Almacén - Resumen Semanal</h1>

        {/* Selectores de semana */}
        <div className="week-specific-selector mb-4 flex space-x-2">
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="p-2 border rounded"
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>

          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="p-2 border rounded"
          >
            {months.map((month, index) => (
              <option key={month} value={index}>{month}</option>
            ))}
          </select>

          <select 
            value={selectedWeekOfMonth} 
            onChange={(e) => setSelectedWeekOfMonth(parseInt(e.target.value))}
            className="p-2 border rounded"
          >
            {weeks.map(week => (
              <option key={week} value={week}>Semana {week}</option>
            ))}
          </select>
        </div>

        {/* Resumen semanal */}
        <div className="targeta grid grid-cols-2 gap-4 mb-6">
          <div className="card bg-blue-100 p-4 rounded">
            <h2 className="text-lg font-semibold">Total Comprado</h2>
            <p className="text-2xl">{formatCurrency(weeklySummary.totalCompra)}</p>
          </div>
          <div className="card bg-green-100 p-4 rounded">
            <h2 className="text-lg font-semibold">Total Vendido</h2>
            <p className="text-2xl">{formatCurrency(weeklySummary.totalVenta)}</p>
          </div>
          <div className="card bg-yellow-100 p-4 rounded">
            <h2 className="text-lg font-semibold">Gramos Totales</h2>
            <p className="text-2xl">{weeklySummary.totalGramos.toFixed(2)} g</p>
          </div>
        </div>

        {/* Gráfica de barras */}
        <div className="barras">
          <h2 className="text-xl font-bold mb-4">Distribución de Café por Tipo</h2>
          <Bar data={chartData} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;