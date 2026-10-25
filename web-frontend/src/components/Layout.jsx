import Footer from "./Footer";
import Navbar from "./Navbar";

export default function Layout({ children }) {
  return (
    <div className="app-shell">
      <Navbar />
      <div className="page-content">{children}</div>
      <Footer />
    </div>
  );
}
