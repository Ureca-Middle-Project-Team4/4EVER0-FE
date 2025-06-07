import { createBrowserRouter } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import Home from "./pages/Home";
import DesignSystemTest from "./pages/Test/DesignSystemTest";

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/design_system",
        element: <DesignSystemTest />,
      },
    ],
  },
]);

export default router;
