'use client'

import {UserDTO} from "@/lib/user";
import {createContext, useCallback, useContext, useEffect, useState} from "react";
import apiClient from "@/lib/api/client";
import {useRouter} from "next/navigation";


interface AuthContextValue{
    isLoggedIn:boolean
    ready:boolean
    user: UserDTO|null
    canteenId:number|null
    isAdmin:boolean
    isManager:boolean
    login: (accessToken:string,refreshToken:string)=>void
    clearSession: ()=>void
}

const AuthContext = createContext<AuthContextValue | null>(null)

// @ts-ignore
/**
 * ADMIN: no scope needed, canteenId stays null.
 * MANAGER: fetch their own canteen so pages can auto-filter by it.
 * Shared by both the initial-load check and the post-login flow, so the
 * "fetch user -> resolve scope" sequence only lives in one place.
 */
async function resolveCanteenScope(user:UserDTO):Promise<number|null>{
    if(!user.roles.includes("ROLE_MANAGER")){
        return null;
    }
    try{
        const res = await apiClient.get("/api/v1/canteens/managed")
        return res.data.data.id
    }catch{
        return null;
    }
}

export function AuthProvider({children}:{children:React.ReactNode}){
    const [isLoggedIn,setIsLoggedIn] = useState(false)
    const [ready,setReady] = useState(false)
    const [user,setUser] = useState<UserDTO|null>(null)
    const [canteenId,setCanteenId]= useState<number|null>(null)
    const isAdmin = user?.roles.includes('ROLE_ADMIN')??false
    const isManager = user?.roles.includes('ROLE_MANAGER')??false

    useEffect(()=>{
        async function checkExistingSession(){
            try{
                const accessToken = localStorage.getItem("accessToken")
                if(!accessToken){
                    setReady(true)
                    return
                }
                const res = await apiClient.get("/api/v1/users/me")
                const fetchedUser:UserDTO = res.data.data
                setUser(fetchedUser)
                setIsLoggedIn(true)
                const scope = await resolveCanteenScope(fetchedUser)
                setCanteenId(scope)
            }catch{
                setIsLoggedIn(false)
            }finally{
                setReady(true)
            }
        }
        checkExistingSession()
    },[])

    const login = useCallback(async(accessToken:string, refreshToken:string)=>{
        localStorage.setItem('accessToken',accessToken)
        localStorage.setItem('refreshToken',refreshToken)
        const res = await apiClient.get('/api/v1/users/me')
        const fetchedUser:UserDTO = res.data.data
        setUser(fetchedUser)
        setIsLoggedIn(true)

        const scope = await resolveCanteenScope(fetchedUser)
        setCanteenId(scope)
    },[])

    const clearSession = useCallback(()=>{
        apiClient.post('/api/v1/auth/logout').catch(()=>{})
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')

        setUser(null)
        setIsLoggedIn(false)
        setCanteenId(null)
    },[])

    return (
        <AuthContext.Provider
        value={{isLoggedIn,ready,user,canteenId,isAdmin,isManager,login,clearSession}}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth(){
    const ctx = useContext(AuthContext)
    if(!ctx){
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return ctx
}

/**
 * Guards a protected page: redirects unauthenticated visitors to /login.
 */
export function useRequireAuth(){
    const {isLoggedIn, ready} = useAuth()
    const router = useRouter()

    useEffect(() => {
        if(ready && !isLoggedIn){
            router.replace('/login')
        }
    }, [ready,isLoggedIn,router]);
    return {isLoggedIn,ready}
}

/**
 * Guards the merchant console: redirects non-staff users (e.g. students)
 * to /login even if they're authenticated.
 */
export function useRequireStaff(){
    const {isLoggedIn, ready, isAdmin, isManager} = useAuth()
    const router = useRouter()
    const isStaff = isAdmin || isManager

    useEffect(() => {
        if(ready && isLoggedIn && !isStaff){
            router.replace('/login')
        }
    }, [ready, isLoggedIn,isAdmin,isManager,isStaff,router]);
    return {ready, isLoggedIn,isAdmin,isManager}
}