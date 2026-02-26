import type { TDocumentDefinitions } from "pdfmake/interfaces";
import { formatPrice, formatDate, formatTime } from "@/lib/utils/formatters";

interface DailyReportData {
  date: string;
  kpis: {
    salesCount: number;
    totalRevenue: number;
    newLeads: number;
    appointments: number;
    cancellations: number;
  };
  sales: Array<{
    brand: string;
    model: string;
    reference: string;
    year?: number;
    salePrice: number;
    currency: string;
    buyerName: string;
    buyerPhone: string;
    buyerEmail: string;
    salesRepName: string;
    soldAt: string;
  }>;
  newLeads: Array<{
    type: string;
    name: string;
    email: string;
    phone: string;
    source: string;
    assignedTo: string;
  }>;
  appointments: Array<{
    customerName: string;
    serviceType: string;
    status: string;
    time: string;
  }>;
  inventoryChanges: Array<{
    action: string;
    brand: string;
    model: string;
    reference: string;
  }>;
}

export function buildDailyReportDefinition(data: DailyReportData): TDocumentDefinitions {
  return {
    pageSize: "A4",
    pageOrientation: "portrait",
    pageMargins: [40, 60, 40, 60],

    defaultStyle: {
      fontSize: 9,
      color: "#333333",
    },

    header: {
      columns: [
        { text: "ERSAN DIAMOND", style: "headerBrand", margin: [40, 20, 0, 0] },
        { text: `Daily Report | ${data.date}`, style: "headerDate", alignment: "right", margin: [0, 20, 40, 0] },
      ],
    },

    content: [
      // KPI Summary
      { text: "DAILY SUMMARY", style: "sectionTitle" },
      {
        columns: [
          { text: `${data.kpis.salesCount}`, style: "kpiValue" },
          { text: `${formatPrice(data.kpis.totalRevenue)}`, style: "kpiValue" },
          { text: `${data.kpis.newLeads}`, style: "kpiValue" },
          { text: `${data.kpis.appointments}`, style: "kpiValue" },
          { text: `${data.kpis.cancellations}`, style: "kpiValue" },
        ],
      },
      {
        columns: [
          { text: "Sales", style: "kpiLabel" },
          { text: "Revenue", style: "kpiLabel" },
          { text: "New Leads", style: "kpiLabel" },
          { text: "Appointments", style: "kpiLabel" },
          { text: "Cancellations", style: "kpiLabel" },
        ],
        margin: [0, 0, 0, 20] as [number, number, number, number],
      },

      // Sales Detail
      ...(data.sales.length > 0
        ? [
            { text: "SALES", style: "sectionTitle" } as any,
            {
              table: {
                headerRows: 1,
                widths: ["*", 80, 80, "*", 60, 60],
                body: [
                  [
                    { text: "Product", style: "tableHeader" },
                    { text: "Price", style: "tableHeader" },
                    { text: "Currency", style: "tableHeader" },
                    { text: "Buyer", style: "tableHeader" },
                    { text: "Rep", style: "tableHeader" },
                    { text: "Time", style: "tableHeader" },
                  ],
                  ...data.sales.map((s) => [
                    `${s.brand} ${s.model}\n${s.reference}${s.year ? ` (${s.year})` : ""}`,
                    formatPrice(s.salePrice, s.currency),
                    s.currency,
                    `${s.buyerName}\n${s.buyerPhone}\n${s.buyerEmail}`,
                    s.salesRepName,
                    formatTime(s.soldAt),
                  ]),
                ],
              },
              layout: "lightHorizontalLines",
              margin: [0, 0, 0, 20] as [number, number, number, number],
            },
          ]
        : []),

      // New Leads
      ...(data.newLeads.length > 0
        ? [
            { text: "NEW LEADS", style: "sectionTitle" } as any,
            {
              table: {
                headerRows: 1,
                widths: [60, "*", "*", 70, 80],
                body: [
                  [
                    { text: "Type", style: "tableHeader" },
                    { text: "Customer", style: "tableHeader" },
                    { text: "Contact", style: "tableHeader" },
                    { text: "Source", style: "tableHeader" },
                    { text: "Assigned", style: "tableHeader" },
                  ],
                  ...data.newLeads.map((l) => [
                    l.type,
                    l.name,
                    `${l.email}\n${l.phone}`,
                    l.source,
                    l.assignedTo || "-",
                  ]),
                ],
              },
              layout: "lightHorizontalLines",
              margin: [0, 0, 0, 20] as [number, number, number, number],
            },
          ]
        : []),

      // Appointments
      ...(data.appointments.length > 0
        ? [
            { text: "APPOINTMENTS", style: "sectionTitle" } as any,
            {
              table: {
                headerRows: 1,
                widths: ["*", 100, 80, 60],
                body: [
                  [
                    { text: "Customer", style: "tableHeader" },
                    { text: "Service", style: "tableHeader" },
                    { text: "Status", style: "tableHeader" },
                    { text: "Time", style: "tableHeader" },
                  ],
                  ...data.appointments.map((a) => [a.customerName, a.serviceType, a.status, a.time]),
                ],
              },
              layout: "lightHorizontalLines",
              margin: [0, 0, 0, 20] as [number, number, number, number],
            },
          ]
        : []),

      // Inventory Changes
      ...(data.inventoryChanges.length > 0
        ? [
            { text: "INVENTORY CHANGES", style: "sectionTitle" } as any,
            {
              table: {
                headerRows: 1,
                widths: [80, "*", "*", "*"],
                body: [
                  [
                    { text: "Action", style: "tableHeader" },
                    { text: "Brand", style: "tableHeader" },
                    { text: "Model", style: "tableHeader" },
                    { text: "Reference", style: "tableHeader" },
                  ],
                  ...data.inventoryChanges.map((i) => [i.action, i.brand, i.model, i.reference]),
                ],
              },
              layout: "lightHorizontalLines",
            },
          ]
        : []),
    ],

    styles: {
      headerBrand: { fontSize: 14, bold: true, color: "#0A0A0A" },
      headerDate: { fontSize: 10, color: "#8A8A8A" },
      sectionTitle: {
        fontSize: 11,
        bold: true,
        color: "#0A0A0A",
        margin: [0, 16, 0, 8] as [number, number, number, number],
        decoration: "underline" as const,
      },
      kpiValue: { fontSize: 22, bold: true, color: "#0A0A0A", alignment: "center" as const },
      kpiLabel: { fontSize: 8, color: "#8A8A8A", alignment: "center" as const },
      tableHeader: { fontSize: 8, bold: true, color: "#8A8A8A", fillColor: "#F5F5F5" },
    },
  };
}
