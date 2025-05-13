import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom';
import Layout from './components/Layout';
import Main from './routes/main';
import Reservation from './routes/reservation';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Navigate to="/home" replace />,
      },
      { path: 'home', element: <Main /> },
      { path: 'reservation', element: <Reservation /> },
    ], 
  },
],{ basename: "/ip-car-rental" });

function App() {

  return <RouterProvider router={router} />;
}

export default App;
