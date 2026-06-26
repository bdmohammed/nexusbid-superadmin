export default function PageHeading({

title,

description

}){

return(

<div>

<h1 className="text-3xl font-bold">

{title}

</h1>

<p className="text-gray-500 mt-1">

{description}

</p>

</div>

);

}