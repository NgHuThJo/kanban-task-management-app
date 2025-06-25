import styles from "./error.module.css";

type ErrorMessageProps = {
  error: string;
};

export function ErrorMessage({ error }: ErrorMessageProps) {
  return <p className={styles.error}>{error}</p>;
}
