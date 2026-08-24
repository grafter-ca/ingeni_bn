// App.tsx
import "./App.css";
import CookieConsentBanner from "./components/common/CookieConsentBanner";
import Home from "./pages/Home";

const App = () => {
  return (
    <main className="App min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white transition-colors flex flex-col">
      <Home />
      <CookieConsentBanner />
    </main>
  );
};

export default App;