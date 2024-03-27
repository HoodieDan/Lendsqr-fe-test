import '../src/assets/styles/users.scss';
import UserStats from './UserStats';
import {
    FilterListOutlined as FilterListOutlinedIcon,
    MoreVertOutlined as MoreVertOutlinedIcon,
} from '@mui/icons-material';
import api from '../api/api';
import { Pagination } from '@mui/material';
import { UserObject, OpenFilterObject, Stat } from '../utils/interfaces';
import { useEffect, useState } from 'react';
import FilterForm from '../components/FilterForm';
import { userStats, tableHeaders } from '../utils/constants';
import view from '../src/assets/icons/view.png';
import blacklist from '../src/assets/icons/blacklist.png';
import activate from '../src/assets/icons/activate.png';
import { useNavigate } from 'react-router-dom';

function Users() {


    // to store all users retrieved from api call 
    const [users, setUsers] = useState<UserObject[]>([]);
    // function to format date from user object 
    const formattedDate = (dateFromData: string): string => {
        const date = new Date(dateFromData);
        const newFormat = date.toString()
        return `${newFormat.slice(4, 9)}, ${newFormat.slice(10, 21)}`
    }
    // function to format phone number from user object
    const formattedPhoneNumber = (phoneNumber: string): string => {
        return `${phoneNumber.slice(0, 13)}`
    }
    // function to format organization name from user object
    // this function is not necessary and is strictly for visual consistency 
    const formattedOrgName = (orgName: string): string => {
        return `${orgName.slice(0, 20)}`
    }


    // -------------------------------filter popup functionality----------------------------
    // state to store if filter is open 
    const initialState: OpenFilterObject = {
        organization: false,
        username: false,
        email: false,
        phoneNumber: false,
        dateJoined: false,
        status: false,
    }
    const [ isOpen, setIsOpen ] = useState(initialState);
    // function to close filter popup 
    const closePopup = (event: React.MouseEvent<HTMLButtonElement>): void => {
        event.preventDefault();
        setIsOpen(initialState)
    }
    // function to display filters 
    const openFilter = (column: string): void => {
        if (!isOpen[column]) {
            setIsOpen({
                ...initialState,
                [column]: true
            })
        } else {
            setIsOpen(initialState);
        }
    }
    // --------------------------filter popup functionality ends here-----------------------


    useEffect(() => {

        // check local storage for users array and use it available 
        if (localStorage.getItem('users')) {
            const data = JSON.parse(localStorage.getItem('users')!);
            // mockapi.io allows only 100 mock responses for each endpoint 
            // that is why I repeated the same 100 responses 5 times 
            setUsers([
                ...data,
                ...data,
                ...data,
                ...data,
                ...data,
            ]); 
            return;
        } else {
            // if nothing in local Storage, get user data through api call 
            const getUsers = async () => {
                try {
                    const res = await api.get('users');
                    for (let i = 0; i < res.data.length; i++) {
                        if (i % 2 === 0 || i % 3 === 0 ) {
                            res.data[i].status = 'Active';
                        } else if (i % 4 === 0 || i % 5 === 0 ) {
                            res.data[i].status = 'Blacklisted';
                        } else if (i % 6 === 0 || i % 7 === 0 ) {
                            res.data[i].status = 'Inactive';
                        } else {
                            res.data[i].status = 'Pending'
                        }
                    }
                    localStorage.setItem('users', JSON.stringify(res.data))
                    setUsers([
                        ...res.data,
                        ...res.data,
                        ...res.data,
                        ...res.data,
                        ...res.data,
                    ]);
                } catch (error) {
                    console.log(error);
                }
            }
            getUsers();
        }
        
    }, []);


    // ------------------------------pagination functionality here------------------------------  
    // state to store number of users currently being displayed 
    const [usersToDisplay, setUsersToDisplay] = useState<string>('10');
    // state to store page number for pagination 
    const [currentPageIndex, setCurrentPageIndex] = useState<number>(1);
    // number of pages for pagination 
    const[numberOfPages, setNumberOfPages] = useState<number>(50);
    // first and second index for users array slice 
    const firstIndex: number = (currentPageIndex - 1) * +usersToDisplay;
    const secondIndex: number = currentPageIndex * +usersToDisplay;
    // array of users to be displayed (as selected at the bottom) 
    const usersOnPage: UserObject[] = users.slice(firstIndex, secondIndex);
    // set number of users to display and update the number of pages for pagination 
    const handleSelect = (event: React.ChangeEvent<HTMLSelectElement>): void => {
        setUsersToDisplay(`${event.target.value}`);
        setNumberOfPages(users.length/+event.target.value);
    }
    // jump to page function for pagination component 
    const changePage = (val: number): void => {
        setCurrentPageIndex(val);
        // scrollToTop();
    }
    // -----------------------------pagination functionality ends here------------------------------ 
    

    // -------------------------------user options functionality here-------------------------------------
    const navigate = useNavigate();
    const [showOptions, setShowOptions] = useState<number>(0)
    // i used index instead of ID here because some IDs are repeated 
    // (as I stated above, I had to spread the same response 5 times because there are only a hundred responses )
    const toggleUserOptions = (index: number): void => {
        if (index === showOptions) {
            setShowOptions(0);
        } else {
            setShowOptions(index)
        }
    }
    const viewUser = (user: UserObject): void => {
        navigate(`users/${user.id}`);
    }
    // -------------------------------user options functionality ends here-----------------------------


    return (

        <div className="users">
            <h2>Users</h2>

            <div className="user-stats">
                {userStats.map((stat: Stat, index) => (
                    <UserStats stat={stat} key={index} />
                ))}
            </div>

            <div className="user-info">
                <table>
                    <thead>
                        <tr>
                            {tableHeaders.map((header, index) => (
                                <th key={index}>
                                    <div className="head">
                                        <h6>{header}</h6>
                                        <FilterListOutlinedIcon className='filter-icon'  onClick={() => openFilter(header)} />
                                    </div>
                                    { isOpen[header] && (
                                        <div className="filter">
                                            <FilterForm closePopup={closePopup} />
                                        </div>
                                    )}
                                </th>
                            ))}
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {usersOnPage.map((user, index) => (
                            <tr key={index}>
                                <td>{ formattedOrgName(user.orgName) }</td>
                                <td>{ user.userName }</td>
                                <td>{ user.email }</td>
                                <td>{ formattedPhoneNumber(user.phoneNumber) }</td>
                                <td>{ formattedDate(user.createdAt) }</td>
                                <td>
                                    <div className={user.status}>
                                        <p>{ user.status }</p>
                                    </div>
                                </td>
                                <td><MoreVertOutlinedIcon className='options' onClick={() => toggleUserOptions(index + 1)} /></td>
                                {/* default is 0 and when it is not 0, the options for the user at that index should show  */}
                                { (showOptions === index + 1) && (
                                    <td className="user-options">
                                        <div className="option" onClick={() => viewUser(user)}>
                                            <img src={view} alt="view details icon" />
                                            <p>View Details</p>
                                        </div>
                                        <div className="option">
                                            <img src={blacklist} alt="blacklist user icon" />
                                            <p>Blacklist User</p>
                                        </div>
                                        <div className="option">
                                            <img src={activate} alt="activate user icon" />
                                            <p>Activate User</p>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="pagination-row">
                <div className="pagination-col">
                    <p>Showing 
                        <select value={ usersToDisplay } onChange={ handleSelect }>
                            <option value="10">10</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                        </select>
                        out of { users.length }
                    </p>
                </div>
                <div className="pagination-col">
                    <Pagination count={numberOfPages} shape="rounded" onChange={(event, val)=> changePage(val)} />
                    {/* <Pagination count={10} variant="outlined" shape="rounded" /> */}
                </div>
            </div>

        </div>

    )
}

export default Users;