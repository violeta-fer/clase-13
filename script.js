            document.addEventListener("DOMContentLoaded", () => {
                // Datos: única fuente para textos y cuadrículas
                const datos = {
                    universidades: { total: 1504, origen: 186, destino: 87 },
                    escuelas: { total: 303, origen: 155, destino: 7 },
                };

                document.querySelectorAll("[data-dato]").forEach((el) => {
                    const [grupo, campo] = el.dataset.dato.split(".");
                    el.textContent = datos[grupo][campo];
                });

                // Cuadrículas de ranking
                const ranking = (id, { total, origen, destino }) => {
                    const min = Math.min(origen, destino);
                    const max = Math.max(origen, destino);
                    const celdas = Array.from({ length: total }, (_, i) => {
                        const n = i + 1;
                        const clase = n === destino ? "destino" : n === origen ? "origen" : n > min && n < max ? "entre" : "";
                        return `<span class="${clase}">${n}</span>`;
                    });
                    document.getElementById(id).innerHTML = celdas.join("");
                };

                ranking("universidades", datos.universidades);
                ranking("escuelas", datos.escuelas);

                // Gráficos de radar
                const radar = (id) =>
                    new Chart(document.getElementById(id), {
                        type: "radar",
                        data: {
                            labels: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio"],
                            datasets: [
                                {
                                    label: "Origen",
                                    data: [65, 59, 80, 81, 56, 55, 40],
                                    borderColor: "rgb(54, 162, 235)",
                                    backgroundColor: "rgba(54, 162, 235, 0.2)",
                                },
                                {
                                    label: "Destino",
                                    data: [28, 48, 40, 19, 96, 27, 100],
                                    borderColor: "rgb(255, 99, 132)",
                                    backgroundColor: "rgba(255, 99, 132, 0.2)",
                                },
                            ],
                        },
                    });

                radar("comparaUniversidades");
                radar("comparaEscuelas");

                // Mapa
                const map = L.map("map").setView([45.478031, 9.227319], 3);

                L.tileLayer(
                    "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
                    { maxZoom: 16, attribution: "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ" }
                ).addTo(map);

                L.marker([45.478031, 9.227319])
                    .addTo(map)
                    .bindPopup("<b>Politecnico de Milán</b><br />Scuola di Design.")
                    .openPopup();
            });