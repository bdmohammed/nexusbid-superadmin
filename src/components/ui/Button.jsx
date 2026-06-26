import { cn } from "@/lib/utils";

export default function Button({
    children,
    variant = "primary",
    className,
    ...props
}) {

    const variants = {

        primary:
            "bg-indigo-600 hover:bg-indigo-700 text-white",

        secondary:
            "bg-white border border-gray-200 hover:bg-gray-50",

        ghost:
            "hover:bg-indigo-50 text-gray-700"

    };

    return (

        <button

            className={cn(
                "h-11 px-5 rounded-xl font-medium transition-all duration-200 active:scale-95",
                variants[variant],
                className
            )}

            {...props}

        >

            {children}

        </button>

    );

}