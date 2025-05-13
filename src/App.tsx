import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import Layout from './components/Layout';
import Main from './routes/main';
import Reservation from './routes/reservation';

// Get the base URL from the environment or use the repository name
const baseUrl = import.meta.env.BASE_URL || '/ip-car-rental/';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Main /> },
      { path: 'reservation', element: <Reservation /> },
    ],
  },
], {
  basename: baseUrl
});

function App() {
  return <RouterProvider router={router} />;
}

export default App;
