"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { deleteCustomer } from "@/app/actions/customers";

interface DeleteCustomerFormProps {
  customerId: string;
  customerName: string;
  onSuccess: () => void;
}

export function DeleteCustomerForm({
  customerId,
  customerName,
  onSuccess,
}: DeleteCustomerFormProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`「${customerName}」を削除してもよろしいですか？\nこの操作は取り消せません。`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteCustomer(customerId);
      if (result.success) {
        onSuccess();
      } else {
        alert(result.error || "削除に失敗しました");
      }
    } catch (error) {
      alert("削除に失敗しました");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button size="sm" variant="danger" onClick={handleDelete} disabled={isDeleting}>
      {isDeleting ? "削除中..." : "削除"}
    </Button>
  );
}
