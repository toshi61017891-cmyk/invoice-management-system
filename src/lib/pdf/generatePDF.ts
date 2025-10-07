import { renderToBuffer } from "@react-pdf/renderer";
import { InvoicePDF } from "./InvoicePDF";
import type { ReactElement } from "react";

/**
 * 請求書PDFを生成してBufferとして返す
 */
export async function generateInvoicePDF(
  invoiceData: Parameters<typeof InvoicePDF>[0]["invoice"],
): Promise<Buffer> {
  const pdfElement = InvoicePDF({ invoice: invoiceData }) as ReactElement;
  const buffer = await renderToBuffer(pdfElement);
  return buffer;
}
