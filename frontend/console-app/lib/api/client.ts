// frontend/console-app/lib/api/client.ts
import axios from "axios";

const apiClient = axios.create({
    baseURL:process.env.NEXT_PUBLIC_API_BASE_URL,
})

apiClient.interceptors.request.use(config=>{
    const accessToken = localStorage.getItem("accessToken");
    if(accessToken){
        config.headers.Authorization=`Bearer ${accessToken}`;
    }
    return config;
})

apiClient.interceptors.response.use(
    (response)=>response,
    async(error)=>{
        const originRequest = error.config
        if(error.response?.status==401 && !originRequest._retry){
            originRequest._retry = true;
            try{
                const refreshToken = localStorage.getItem('refreshToken')
                const refreshResponse = await axios.post(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/refreshToken`,{refreshToken:refreshToken}
                )

                const newAccessToken =refreshResponse.data.data.accessToken
                localStorage.setItem('accessToken',newAccessToken)
                originRequest.headers.Authorization=`Bearer ${newAccessToken}`
                return apiClient(originRequest)
            }catch(refreshError){
                localStorage.removeItem('accessToken')
                localStorage.removeItem('refreshToken')

                window.location.href='/login'
                return Promise.reject(refreshError)
            }
        }
        return Promise.reject(error)

    }
)

export default apiClient;