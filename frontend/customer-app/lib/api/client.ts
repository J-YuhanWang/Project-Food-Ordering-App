import axios from "axios";

const apiClient = axios.create({
    baseURL:process.env.NEXT_PUBLIC_API_BASE_URL,
})

// request interceptor: does not check the token has expired,
// it just attaches whatever is currently in the localStorage
apiClient.interceptors.request.use((config)=>{
    const accessToken=localStorage.getItem('accessToken')
    if(accessToken){
        config.headers.Authorization=`Bearer ${accessToken}`
    }
    return config;
})

// Response interceptor: when the access token has expired (401),
// use the refresh token to obtain a new one
apiClient.interceptors.response.use((response)=>response,
    async(error)=>{
        const originalRequest = error.config
        if(error.response?.status===401 && !originalRequest._retry){
            originalRequest._retry=true // mark this request as already retried, to avoid an infinite loop
            // if the retried request also fails with 401
            try{
                const refreshToken=localStorage.getItem('refreshToken')
                const refreshResponse = await axios.post( // using axios.post instead of apiClient.post
                    // using raw axios, not apiClient — this avoids the request itself
                    // being caught by the same response interceptor, which would cause
                    // infinite recursion
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/refreshToken`,{refreshToken:refreshToken}
                )
                //if success
                const newAccessToken = refreshResponse.data.data.accessToken
                localStorage.setItem('accessToken',newAccessToken)

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
                //resend the request with the new accessToken - the caller never sees the 401, the retry is transparent to it
                return apiClient(originalRequest)

            }catch(refreshError){
                //failed -> login page
                localStorage.removeItem('accessToken')
                localStorage.removeItem('refreshToken')

                window.location.href='/login'
                return Promise.reject(refreshError)
            }
        }
        return Promise.reject(error)
    })

export default apiClient;