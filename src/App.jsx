// Date: 2021-09-05

import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import "./App.css";

const TableSection = ({ title, items }) => (
  <section className="grid-section">
    <h2>{title}</h2>
    {items && items.length > 0 ? (
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>{title}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{item}</td>
            </tr>
          ))}
        </tbody>
      </table>
    ) : (
      <p>No hay datos disponibles</p>
    )}
  </section>
);

TableSection.propTypes = {
  title: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.string).isRequired,
};

function App() {
  const [data, setData] = useState({
    catalogs: [],
    contributors: [],
    producttypes: [],
    eventtypes: [],
    magnitudetypes: [],
    earthquakeData: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Primera llamada a la API
    axios
      .get("https://earthquake.usgs.gov/fdsnws/event/1/application.json")
      .then((response) => {
        setData((prevData) => ({
          ...prevData,
          catalogs: response.data.catalogs || [],
          contributors: response.data.contributors || [],
          producttypes: response.data.producttypes || [],
          eventtypes: response.data.eventtypes || [],
          magnitudetypes: response.data.magnitudetypes || [],
        }));
      })
      .catch(() => {
        setError("No se pudieron cargar los datos de la aplicación");
      });

    // Segunda llamada a la API
    axios
      .get("https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2014-01-01&endtime=2014-01-02")
      .then((response) => {
        const earthquakeData = response.data.features.map((feature) => ({
          id: feature.id,
          place: feature.properties.place,
          magnitude: feature.properties.mag,
          time: new Date(feature.properties.time).toLocaleString(), // Formatear la fecha
        }));

        setData((prevData) => ({
          ...prevData,
          earthquakeData, // Guardamos los datos de terremotos en el estado
        }));
        setLoading(false);
      })
      .catch(() => {
        setError("No se pudieron cargar los datos de los terremotos");
        setLoading(false);
      });
  }, []);

  // Combinar todos los datos para mostrar en una tabla
  const combinedData = data.earthquakeData.map(item => 
    `${item.time} - ${item.place} (Magnitud: ${item.magnitude})`
  );

  return (
    <div className="App">
      <h1>Datos de Terremotos</h1>

      {loading && <p>Cargando datos...</p>}
      {!loading && error && <p className="error">{error}</p>}

      <div className="grid-container">
        <TableSection title="Catálogos" items={data.catalogs} />
        <TableSection title="Contribuyentes" items={data.contributors} />
        <TableSection title="Tipos de Productos" items={data.producttypes} />
        <TableSection title="Tipos de Eventos" items={data.eventtypes} />
        <TableSection title="Tipos de Magnitud" items={data.magnitudetypes} />

        {/* Sección para mostrar datos combinados de terremotos */}
        <TableSection title="Datos de Terremotos" items={combinedData} />
      </div>
    </div>
  );
}

export default App;