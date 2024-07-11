import { writable } from "svelte/store";
import { onMount } from "svelte";
import {pb,currentUser} from './pocketbase'
export const useGrid= writable(false)
export const poolfilter=writable(false)
export const hideOthers= writable(false)
export const about= writable(false)
export const NN= writable(true)
export const settings=writable(false)
export const renderDate = writable(new Date());
export const imageUrl = writable(null);
export const swapMsg=writable("Voulez-vous vraiment changer le statut de remplacement de cet horaire?");
export const takeMsg=writable("Voulez-vous vraiment remplacer/prendre cet horaire?");
export const version=writable("v0.6.6");
//employee=@request.auth.id || @request.auth.isAdmin=true add back before relase.
export const shifts=writable([]);
export const swaps=writable([]);// should not be needed
export const dispos=writable([]);
export const heuresV=writable(0);
//defies first and last day (day,month) where engollon is open.
export const seasonstart=writable([18,5]); 
export const seasonend=writable([8,9]); 
export const MainC=writable('#008170');
export const BackC=writable('#444444');
export const AcC=writable('#D95706');
export const n=writable(0);
export const N=writable(0);
export const T=writable("");



//fucntion to update the a shift (input is the shift,user,swap,)
export const updateShift = writable((shift,user,) =>{
    console.log("Shift updated" ,shift.username);
});
