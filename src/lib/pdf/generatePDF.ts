import { renderToBuffer, Document } from "@react-pdf/renderer";
import { InvoicePDF } from "./InvoicePDF";
import type { ReactElement } from "react";

/**
 * 請求書PDFを生成してBufferとして返す
 */
export async function generateInvoicePDF(
  invoiceData: Parameters<typeof InvoicePDF>[0]["invoice"],
): Promise<Buffer> {
  const pdfElement = InvoicePDF({ invoice: invoiceData }) as unknown as ReactElement<Document>;
  const buffer = await renderToBuffer(pdfElement as any);
  return buffer;
}
