import { useRouteError, Link } from "react-router-dom";

export function ErrorBoundary() {
  const error = useRouteError() || {};
  console.error(error);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
      <div className="max-w-md w-full p-6 space-y-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          {error?.status === 404 ? "Page Not Found" : "Oops!"}
        </h1>
        <p className="text-muted-foreground">
          {error?.status === 404
            ? "Sorry, we couldn't find the page you're looking for."
            : "Sorry, an unexpected error has occurred."}
        </p>
        <p className="text-sm text-muted-foreground">
          {error?.statusText || error?.message || "Unknown error occurred"}
        </p>
        <div className="pt-6">
          <Link
            to="/"
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Go back home
          </Link>
        </div>
      </div>
    </div>
  );
}

export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
      <div className="max-w-md w-full p-6 space-y-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Page Not Found</h1>
        <p className="text-muted-foreground">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <div className="pt-6">
          <Link
            to="/"
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Go back home
          </Link>
        </div>
      </div>
    </div>
  );
} 