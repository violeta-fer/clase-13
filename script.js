document.addEventListener("DOMContentLoaded", () => {
    // Datos: única fuente para textos y cuadrículas
    // Fuente: Excel QS World University Rankings 2027 y QS by Subject 2026 (Art & Design)
    const datos = {
        universidades: { total: 1504, origen: 185, destino: 87 },
        escuelas: { total: 303, origen: 155, destino: 7 }, // Chile figura en el tramo 151-200
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

    // Gráficos de radar (puntajes reales, escala 0-100)
    const NOMBRE_ORIGEN = "Universidad de Chile";
    const NOMBRE_DESTINO = "Politecnico di Milano";

    const radar = (id, labels, origen, destino, detalle) =>
        new Chart(document.getElementById(id), {
            type: "radar",
            data: {
                labels,
                datasets: [
                    {
                        label: NOMBRE_ORIGEN,
                        data: origen,
                        borderColor: "rgb(54, 162, 235)",
                        backgroundColor: "rgba(54, 162, 235, 0.2)",
                    },
                    {
                        label: NOMBRE_DESTINO,
                        data: destino,
                        borderColor: "rgb(255, 99, 132)",
                        backgroundColor: "rgba(255, 99, 132, 0.2)",
                    },
                ],
            },
            options: {
                plugins: {
                    legend: { position: "bottom", labels: { font: { size: 14 } } },
                    tooltip: {
                        callbacks: {
                            label: (ctx) =>
                                detalle
                                    ? `${ctx.dataset.label}: ${detalle[ctx.datasetIndex][ctx.dataIndex]}`
                                    : `${ctx.dataset.label}: ${ctx.parsed.r}`,
                        },
                    },
                },
                scales: {
                    r: {
                        min: 0,
                        max: 100,
                        ticks: { stepSize: 20, backdropColor: "transparent" },
                        pointLabels: { font: { size: 13 } },
                    },
                },
            },
        });

    // QS World University Rankings 2027: 7 de los 9 indicadores
    // Se omiten "Razón docente-estudiante" (casi igual en ambas: 9.9 vs 8.9)
    // y "Red de investigación internacional" (la menos contrastante: 76.8 vs 84.2)
    radar(
        "comparaUniversidades",
        [
            "Reputación académica",
            "Reputación entre empleadores",
            "Citas por docente",
            "Docentes internacionales",
            "Estudiantes internacionales",
            "Resultados de empleabilidad",
            "Sostenibilidad",
        ],
        [92.0, 85.1, 16.0, 10.6, 8.2, 95.7, 66.4], // Universidad de Chile
        [84.5, 93.6, 54.2, 75.9, 72.9, 66.3, 86.2] // Politecnico di Milano
    );

    // QS by Subject 2026, Art & Design: puntaje y posición de cada indicador.
    // La posición se invierte a escala 0-100 (100 = lugar 1) para que, igual que el puntaje,
    // "más afuera" signifique "mejor": 100 * (1 - (posición - 1) / posición máxima de esa columna).
    const MAX_RANK_ACADEMICO = 358;
    const MAX_RANK_EMPLEADORES = 1904;
    const invertir = (pos, max) => Math.round(100 * (1 - (pos - 1) / max) * 10) / 10;

    // [puntaje académico, posición académica, puntaje empleadores, posición empleadores]
    const chile = { ac: 52.5, acPos: 186, em: 78.5, emPos: 37 };
    const polimi = { ac: 82.8, acPos: 10, em: 87.4, emPos: 13 };

    const valores = (e) => [
        e.ac,
        invertir(e.acPos, MAX_RANK_ACADEMICO),
        e.em,
        invertir(e.emPos, MAX_RANK_EMPLEADORES),
    ];
    const textos = (e) => [`${e.ac} puntos`, `lugar ${e.acPos}`, `${e.em} puntos`, `lugar ${e.emPos}`];

    radar(
        "comparaEscuelas",
        [
            "Reputación académica (puntaje)",
            "Reputación académica (posición)",
            "Reputación entre empleadores (puntaje)",
            "Reputación entre empleadores (posición)",
        ],
        valores(chile),
        valores(polimi),
        [textos(chile), textos(polimi)]
    );

    // Mapa
    const map = L.map("map").setView([45.5023, 9.1566], 6);

    L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
        { maxZoom: 16, attribution: "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ" }
    ).addTo(map);

    L.marker([45.5023, 9.1566])
        .addTo(map)
        .bindPopup("<b>Politecnico de Milán</b><br />Scuola di Design.")
        .openPopup();
});