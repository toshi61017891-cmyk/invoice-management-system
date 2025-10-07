import type { ReactNode } from "react";

/**
 * 共通カードコンポーネント
 *
 * ダッシュボードや各種一覧画面で使用する汎用カードです。
 */
interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return <div className={`bg-white rounded-lg shadow ${className}`}>{children}</div>;
}

/**
 * カードヘッダー
 */
interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className = "" }: CardHeaderProps) {
  return <div className={`p-6 border-b ${className}`}>{children}</div>;
}

/**
 * カードタイトル
 */
interface CardTitleProps {
  children: ReactNode;
  className?: string;
}

export function CardTitle({ children, className = "" }: CardTitleProps) {
  return <h3 className={`text-sm font-semibold text-gray-700 ${className}`}>{children}</h3>;
}

/**
 * カード本体
 */
interface CardBodyProps {
  children: ReactNode;
  className?: string;
}

export function CardBody({ children, className = "" }: CardBodyProps) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}

/**
 * 空データ表示用のプレースホルダー
 */
interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon = "📭", title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
      {description && <p className="text-sm text-gray-500 mb-6">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}
