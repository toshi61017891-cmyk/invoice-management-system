import React from "react";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";

// PDF用のスタイル定義
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
    fontWeight: "bold",
  },
  invoiceNumber: {
    fontSize: 12,
    marginBottom: 5,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    paddingBottom: 5,
  },
  row: {
    flexDirection: "row",
    marginBottom: 5,
  },
  label: {
    width: "30%",
    fontWeight: "bold",
  },
  value: {
    width: "70%",
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 2,
    borderBottomColor: "#000",
    paddingBottom: 5,
    marginBottom: 5,
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  col1: { width: "40%" },
  col2: { width: "15%", textAlign: "right" },
  col3: { width: "20%", textAlign: "right" },
  col4: { width: "25%", textAlign: "right" },
  totalSection: {
    marginTop: 20,
    alignItems: "flex-end",
  },
  totalRow: {
    flexDirection: "row",
    width: "40%",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  totalLabel: {
    fontWeight: "bold",
  },
  grandTotal: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 10,
  },
  footer: {
    marginTop: 30,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    fontSize: 9,
  },
});

interface InvoiceItem {
  name: string;
  description: string | null;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface InvoiceData {
  invoiceNumber: string;
  issuedAt: Date;
  dueDate: Date;
  customer: {
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
  };
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  notes: string | null;
}

export const InvoicePDF: React.FC<{ invoice: InvoiceData }> = ({ invoice }) => {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return `¥${amount.toLocaleString()}`;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ヘッダー */}
        <View style={styles.header}>
          <Text style={styles.title}>請求書 / Invoice</Text>
          <Text style={styles.invoiceNumber}>請求書番号: {invoice.invoiceNumber}</Text>
          <Text style={styles.invoiceNumber}>発行日: {formatDate(invoice.issuedAt)}</Text>
          <Text style={styles.invoiceNumber}>支払期限: {formatDate(invoice.dueDate)}</Text>
        </View>

        {/* 顧客情報 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>請求先 / Bill To</Text>
          <View style={styles.row}>
            <Text style={styles.label}>顧客名:</Text>
            <Text style={styles.value}>{invoice.customer.name}</Text>
          </View>
          {invoice.customer.email && (
            <View style={styles.row}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{invoice.customer.email}</Text>
            </View>
          )}
          {invoice.customer.phone && (
            <View style={styles.row}>
              <Text style={styles.label}>電話番号:</Text>
              <Text style={styles.value}>{invoice.customer.phone}</Text>
            </View>
          )}
          {invoice.customer.address && (
            <View style={styles.row}>
              <Text style={styles.label}>住所:</Text>
              <Text style={styles.value}>{invoice.customer.address}</Text>
            </View>
          )}
        </View>

        {/* 明細 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>明細 / Items</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.col1}>品目</Text>
              <Text style={styles.col2}>数量</Text>
              <Text style={styles.col3}>単価</Text>
              <Text style={styles.col4}>小計</Text>
            </View>
            {invoice.items.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <View style={styles.col1}>
                  <Text>{item.name}</Text>
                  {item.description && (
                    <Text style={{ fontSize: 8, color: "#666", marginTop: 2 }}>
                      {item.description}
                    </Text>
                  )}
                </View>
                <Text style={styles.col2}>{item.quantity}</Text>
                <Text style={styles.col3}>{formatCurrency(item.unitPrice)}</Text>
                <Text style={styles.col4}>{formatCurrency(item.amount)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 合計 */}
        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>小計:</Text>
            <Text>{formatCurrency(invoice.subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>消費税:</Text>
            <Text>{formatCurrency(invoice.tax)}</Text>
          </View>
          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text style={styles.totalLabel}>合計:</Text>
            <Text>{formatCurrency(invoice.total)}</Text>
          </View>
        </View>

        {/* 備考 */}
        {invoice.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>備考 / Notes</Text>
            <Text>{invoice.notes}</Text>
          </View>
        )}

        {/* フッター */}
        <View style={styles.footer}>
          <Text>この請求書は電子的に生成されています。</Text>
          <Text>お支払いに関するご質問は、メールまたは電話にてお問い合わせください。</Text>
        </View>
      </Page>
    </Document>
  );
};
