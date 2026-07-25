import {UserDTO} from "@/lib/user";


export interface CanteenAdminDTO {
    id: number;
    name: string;
    canteenType:string;
    imageUrl: string | null;
    manager: UserDTO | null;
}