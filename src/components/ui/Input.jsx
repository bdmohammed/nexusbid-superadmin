import { cn } from "@/lib/utils";

export default function Input({

className,

...props

}){

return(

<input

className={cn(

"w-full h-11 rounded-xl border border-gray-200 px-4 outline-none",

"focus:ring-2 focus:ring-indigo-500",

className

)}

{...props}

/>

);

}