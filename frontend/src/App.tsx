import { AppShell } from "./components/layout/AppShell";
import { useRouteSlug } from "./lib/router";
import { DropPage } from "./pages/DropPage";
import { UploadPage } from "./pages/UploadPage";

export default function App() {
  const slug = useRouteSlug();

  return (
    <AppShell>
      {slug ? <DropPage key={slug} slug={slug} /> : <UploadPage />}
    </AppShell>
  );
}
