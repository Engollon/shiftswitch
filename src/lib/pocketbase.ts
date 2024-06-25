import Pocketbase, { getTokenPayload} from "pocketbase";
import {writable} from 'svelte/store';
import {NN,heuresV} from './preferances';
export const pb=new Pocketbase('https://shiftswitch.pockethost.io');
export const currentUser=writable(pb.authStore.model);
export const isAdmin=writable(false)
pb.authStore.onChange((auth)=>{
    currentUser.set(pb.authStore.model);
    if(pb.authStore.model!=null){
        isAdmin.set(pb.authStore.model.isAdmin) 
    }else{
        //logout
    }
})