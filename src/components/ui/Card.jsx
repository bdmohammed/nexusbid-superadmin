import { cn } from "@/lib/utils";

export default function Card({

children,

className,

...props

}){

return(

<div

className={cn(

"bg-white border border-[#E4E1EE] rounded-2xl shadow-sm",

className

)}

{...props}

>

{children}

</div>

);

}