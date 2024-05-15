import {Login} from '../components/Login'
import {Home} from '../components/Home'
import {Lottery} from '../components/Lottery'
import {Profile} from '../components/Profile'
import {Roulette} from '../components/Roulette'
import {Dice} from '../components/Dice'
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
    },
    {
        path: Path.Lottery,
        component: Lottery,
        exact: true,
    },
    {
        path: Path.Profile,
        component: Profile,
        exact: true,
    },
    {
        path: Path.Roulette,
        component: Roulette,
        exact: true,
    },
    {
        path: Path.Dice,
        component: Dice,
        exact: true,
    },
]

export default routes;

