function getSpecForOrder(order) {
    return {
        $schema: "https://vega.github.io/schema/vega-lite/v5.json",
        title: order,
        width: 400,  // Adjusted width
        height: 250,  // Increased height
        data: { url: "data.csv", format: { type: "csv" } },
        transform: [
            { filter: { field: "order", oneOf: [order] } },
            { calculate: "toString(datum['Treating.Clinician'])", as: "Clinician_String" },
            { fold: ["percentage", "hospital_each_average", "hospital_all_average"], as: ["metric", "value"] },
            { calculate: "datum.metric === 'percentage' ? 'Percentage of ' + datum.order : datum.metric", as: "metric" }
        ],
        mark: "bar",
        encoding: {
            x: {
                field: "metric",
                type: "ordinal",
                axis: { labelAngle: 0 }
            },
            y: { field: "value", type: "quantitative", title: "Percentage(%)" },
            color: { 
                field: "metric", 
                type: "nominal",
                scale: { 
                    domain: ["percentage", "hospital_each_average", "hospital_all_average"], 
                    range: ["#e6550d", "#756bb1", "#2c7fb8"] 
                }
            },
            tooltip: [
                { field: "Clinician_String", type: "nominal", title: "Clinician" },
                { field: "metric", type: "ordinal", title: "Metric" },
                { field: "value", type: "quantitative", title: "Percentage(%)" },
                { field: "Hospital", type: "nominal", title: "Hospital" }
            ]
        }
    };
}




// Function to update visualizations based on hospital and clinician selection
function updateVisualizations() {
    const clinician = document.getElementById("clinicianDropdown").value;
    const hospital = document.getElementById("hospitalDropdown").value;

    const orders = ["Adrenaline", "Blood Test", "Corticosteroids", "Salbutamol", "Chest X-ray", "Antibiotics"];
    const visualizationIDs = [
        "visualizationAdrenaline", "visualizationBloodTest", "visualizationCorticosteroids", 
        "visualizationSalbutamol", "visualizationChestXray", "visualizationAntibiotics"
    ];

    orders.forEach((order, index) => {
        const spec = getSpecForOrder(order);
        if (clinician !== "") {
            spec.transform.push({ filter: { field: "Clinician_String", oneOf: [clinician] } });
        }
        if (hospital !== "") {
            spec.transform.push({ filter: { field: "Hospital", oneOf: [hospital] } });
        }
        vegaEmbed(`#${visualizationIDs[index]}`, spec);
    });
}

// Populate dropdowns and set up event listeners
fetch("data.csv")
    .then(response => response.text())
    .then(data => {
        const rows = data.split("\n").slice(1);
        const clinicians = [...new Set(rows.map(row => row.split(",")[0]))];
        const hospitals = [...new Set(rows.map(row => row.split(",")[1]))];

        const clinicianDropdown = document.getElementById("clinicianDropdown");
        clinicians.forEach(clinician => {
            const option = document.createElement("option");
            option.value = clinician;
            option.textContent = clinician;
            clinicianDropdown.appendChild(option);
        });

        const hospitalDropdown = document.getElementById("hospitalDropdown");
        hospitals.forEach(hospital => {
            const option = document.createElement("option");
            option.value = hospital;
            option.textContent = hospital;
            hospitalDropdown.appendChild(option);
        });

        clinicianDropdown.addEventListener("change", updateVisualizations);
        hospitalDropdown.addEventListener("change", updateVisualizations);
    })
    .then(() => {
        // Initial rendering of visualizations
        updateVisualizations();
    });
