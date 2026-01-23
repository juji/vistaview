import { MetaProvider, Title } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import "./app.css";

export default function App() {
  return (
    <Router
      root={props => (
        <MetaProvider>
          <Title>SolidStart - Basic</Title>
          <nav style={{ margin: '24px 0', textAlign: 'center' }}>
            <a href="/" style={{ margin: '0 16px' }}>Basic</a>
            <a href="/hook" style={{ margin: '0 16px' }}>Hook</a>
          </nav>
          <Suspense>{props.children}</Suspense>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
