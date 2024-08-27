export type ColorType = {
    target: string; // desired color
    slot: string; // use as slot color
    slotRendered: string;
    plastic: string; // use as object color (roughness=1, metallic=0)
    plasticRendered: string;
    widget: string; // use as widget color
    widgetRendered: string;
};

export const COLORS: Record<string, Array<ColorType>> = {
    green: [
        {
            target: "#00C60A",
            slot: "#00C702",
            slotRendered: "#01C609",
            plastic: "#06CC44",
            plasticRendered: "#00C50A",
            widget: "#02B615",
            widgetRendered: "#00C408",
        },
        {
            target: "#5DC262",
            slot: "#5DC362",
            slotRendered: "#5DC262",
            plastic: "#75CA72",
            plasticRendered: "#5DC162",
            widget: "#39B838",
            widgetRendered: "#5DC262",
        },
        {
            target: "#0C9113",
            slot: "#04920B",
            slotRendered: "#0C9113",
            plastic: "#3C9531",
            plasticRendered: "#0B9113",
            widget: "#115C0D",
            widgetRendered: "#0A8F12",
        },
        {
            target: "#82EB09",
            slot: "#83EC02",
            slotRendered: "#82EB09",
            plastic: "#9BFE54",
            plasticRendered: "#82E608",
            widget: "#61FE1E",
            widgetRendered: "#80DB08",
        },
        {
            target: "#09EB67",
            slot: "#02EC67",
            slotRendered: "#09EB67",
            plastic: "#5FFE7D",
            plasticRendered: "#08E666",
            widget: "#22FE40",
            widgetRendered: "#0ADB67",
        },
    ],
    red: [
        {
            target: "#FF0505",
            slot: "#FE0101",
            slotRendered: "#FE0606",
            plastic: "#FE2221",
            plasticRendered: "#E80406",
            widget: "#FE0808",
            widgetRendered: "#D90305",
        },
        {
            target: "#AD5E5E",
            slot: "#AE5E5E",
            slotRendered: "#AD5E5E",
            plastic: "#B86868",
            plasticRendered: "#AD5E5E",
            widget: "#952D2E",
            widgetRendered: "#AD5F5E",
        },
        {
            target: "#C02516",
            slot: "#C1200E",
            slotRendered: "#C02516",
            plastic: "#CF3524",
            plasticRendered: "#C02616",
            widget: "#B60E09",
            widgetRendered: "#BC2415",
        },
        {
            target: "#CF213E",
            slot: "#D01B3C",
            slotRendered: "#CF213E",
            plastic: "#DF334B",
            plasticRendered: "#CF213E",
            widget: "#DE0E19",
            widgetRendered: "#CE223D",
        },
        {
            target: "#FF6969",
            slot: "#FE6969",
            slotRendered: "#FE6969",
            plastic: "#FE7273",
            plasticRendered: "#E76968",
            widget: "#FE3639",
            widgetRendered: "#DA6869",
        },
    ],
    yellow: [
        {
            target: "#FFD900",
            slot: "#FEDA00",
            slotRendered: "#FED901",
            plastic: "#FEE62B",
            plasticRendered: "#E4D501",
            widget: "#FEF112",
            widgetRendered: "#D7D500",
        },
        {
            target: "#FCE979",
            slot: "#FCEA7A",
            slotRendered: "#FCE979",
            plastic: "#FEFE8E",
            plasticRendered: "#E0E27B",
            widget: "#FEFE52",
            widgetRendered: "#D5D779",
        },
        {
            target: "#A69317",
            slot: "#A79410",
            slotRendered: "#A69317",
            plastic: "#AC9A3D",
            plasticRendered: "#A69417",
            widget: "#7D5D11",
            widgetRendered: "#A58E16",
        },
        {
            target: "#D6BD4B",
            slot: "#D7BE4A",
            slotRendered: "#D6BD4B",
            plastic: "#E8C868",
            plasticRendered: "#D6BD4B",
            widget: "#FDB62F",
            widgetRendered: "#D7BE4B",
        },
        {
            target: "#F6FF00",
            slot: "#F6FE00",
            slotRendered: "#F6FE01",
            plastic: "#FEFE06",
            plasticRendered: "#E1E500",
            widget: "#FEFE02",
            widgetRendered: "#D6D900",
        },
    ],
    pink: [
        {
            target: "#FF74D6",
            slot: "#FE75D7",
            slotRendered: "#FE74D6",
            plastic: "#FE79E7",
            plasticRendered: "#EE74D7",
            widget: "#FE3DF8",
            widgetRendered: "#E174D6",
        },
        {
            target: "#EDADD9",
            slot: "#EEAEDA",
            slotRendered: "#EDADD9",
            plastic: "#FEB1F2",
            plasticRendered: "#E5A9DB",
            widget: "#FE86FC",
            widgetRendered: "#D9A8D5",
        },
        {
            target: "#C21F90",
            slot: "#C31991",
            slotRendered: "#C21F90",
            plastic: "#C43992",
            plasticRendered: "#C11F90",
            widget: "#A9105C",
            widgetRendered: "#C21F90",
        },
        {
            target: "#BD2DB0",
            slot: "#BE29B1",
            slotRendered: "#BD2DB0",
            plastic: "#BD41B0",
            plasticRendered: "#BD2DAF",
            widget: "#9B148C",
            widgetRendered: "#BC2EB0",
        },
        {
            target: "#DE64B1",
            slot: "#DF64B2",
            slotRendered: "#DE64B1",
            plastic: "#E76FB4",
            plasticRendered: "#DE64B1",
            widget: "#F43390",
            widgetRendered: "#DE64B1",
        },
    ],
    orange: [
        {
            target: "#FF8C00",
            slot: "#FE8D00",
            slotRendered: "#FE8C01",
            plastic: "#FE9406",
            plasticRendered: "#EA8C00",
            widget: "#FE5E00",
            widgetRendered: "#DE8C00",
        },
        {
            target: "#E09F5C",
            slot: "#E1A05C",
            slotRendered: "#E09F5C",
            plastic: "#F6A66E",
            plasticRendered: "#E19F5C",
            widget: "#FE7734",
            widgetRendered: "#DA9F5C",
        },
        {
            target: "#854300",
            slot: "#864100",
            slotRendered: "#854301",
            plastic: "#8E4E00",
            plasticRendered: "#854300",
            widget: "#561B00",
            widgetRendered: "#864300",
        },
        {
            target: "#FF6200",
            slot: "#FE6200",
            slotRendered: "#FE6201",
            plastic: "#FE6D00",
            plasticRendered: "#E96200",
            widget: "#FE3200",
            widgetRendered: "#DC6200",
        },
        {
            target: "#FFA600",
            slot: "#FEA700",
            slotRendered: "#FEA601",
            plastic: "#FEAF02",
            plasticRendered: "#E9A600",
            widget: "#FE8106",
            widgetRendered: "#DDA500",
        },
    ],
    purple: [
        {
            target: "#B252FF",
            slot: "#B351FE",
            slotRendered: "#B252FE",
            plastic: "#B14DFD",
            plasticRendered: "#B252E3",
            widget: "#8A1EFE",
            widgetRendered: "#B251D9",
        },
        {
            target: "#AF76CF",
            slot: "#B077D0",
            slotRendered: "#AF76CF",
            plastic: "#B27BD9",
            plasticRendered: "#AF76CE",
            widget: "#8A3FE0",
            widgetRendered: "#AF76CF",
        },
        {
            target: "#681D91",
            slot: "#681792",
            slotRendered: "#681D91",
            plastic: "#6E2E90",
            plasticRendered: "#681D90",
            widget: "#330C5C",
            widgetRendered: "#691C91",
        },
        {
            target: "#945CED",
            slot: "#955CEE",
            slotRendered: "#945CED",
            plastic: "#9255FD",
            plasticRendered: "#945BE3",
            widget: "#5D25FE",
            widgetRendered: "#945CD8",
        },
        {
            target: "#A600FF",
            slot: "#A700FE",
            slotRendered: "#A601FE",
            plastic: "#A500F3",
            plasticRendered: "#A70ADF",
            widget: "#7400FE",
            widgetRendered: "#A600D9",
        },
    ],
    blue: [
        {
            target: "#00CFFF",
            slot: "#00D0FE",
            slotRendered: "#01CFFE",
            plastic: "#01DBFC",
            plasticRendered: "#01CEE1",
            widget: "#00DEFE",
            widgetRendered: "#00CFD6",
        },
        {
            target: "#6FD9F2",
            slot: "#6FDAF2",
            slotRendered: "#6FD9F2",
            plastic: "#7CF6FD",
            plasticRendered: "#6FDBE0",
            widget: "#3EFEFE",
            widgetRendered: "#6FD5D5",
        },
        {
            target: "#0E96B5",
            slot: "#0697B6",
            slotRendered: "#0E96B5",
            plastic: "#3D99B9",
            plasticRendered: "#0E95B5",
            widget: "#126A98",
            widgetRendered: "#0D99B4",
        },
        {
            target: "#00FFEA",
            slot: "#00FEEB",
            slotRendered: "#01FEEA",
            plastic: "#08FEFC",
            plasticRendered: "#00E2E0",
            widget: "#00FEFE",
            widgetRendered: "#00D8D5",
        },
        {
            target: "#0091FF",
            slot: "#0092FE",
            slotRendered: "#0191FE",
            plastic: "#008EFC",
            plasticRendered: "#0192E2",
            widget: "#0A5AFE",
            widgetRendered: "#0092D8",
        },
    ],
    white: [
        {
            target: "#F0F0F0",
            slot: "#F0F0F0",
            slotRendered: "#F0F0F0",
            plastic: "#FEFEFC",
            plasticRendered: "#DEDFDF",
            widget: "#FEFEFE",
            widgetRendered: "#D4D4D4",
        },
        {
            target: "#969696",
            slot: "#979797",
            slotRendered: "#969696",
            plastic: "#9D9D9A",
            plasticRendered: "#969696",
            widget: "#696968",
            widgetRendered: "#969695",
        },
        {
            target: "#4A4A4A",
            slot: "#484848",
            slotRendered: "#4A4A4A",
            plastic: "#535351",
            plasticRendered: "#4A4A4A",
            widget: "#1E1E1E",
            widgetRendered: "#494949",
        },
        {
            target: "#2C2C2E",
            slot: "#28282A",
            slotRendered: "#2C2C2E",
            plastic: "#313133",
            plasticRendered: "#2C2C2E",
            widget: "#0D0D0E",
            widgetRendered: "#2C2C2D",
        },
        {
            target: "#2E2626",
            slot: "#2A2121",
            slotRendered: "#2E2626",
            plastic: "#342A29",
            plasticRendered: "#2E2626",
            widget: "#0E0B0B",
            widgetRendered: "#2E2727",
        },
    ],
};