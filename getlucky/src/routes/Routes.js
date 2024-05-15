import {Login} from '../components/Login'
import {Home} from '../components/Home'
import ProtectedRoute from '../components/ProtectedRoute'
import Path from './Paths'

const routes = [
    {
        path: Path.Login,
        component: Login,
        exact: true,
    },
    {
        path: Path.Home,
        component: Home,
        exact: true,
    }
]

export default routes;

