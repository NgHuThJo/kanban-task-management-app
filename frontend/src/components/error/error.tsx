type ErrorMessageProps = {
  error: unknown;
};

export function ErrorMessage({ error }: ErrorMessageProps) {
  if (error instanceof Error) {
    return <p>{error.message}</p>;
  }

  return null;
}
