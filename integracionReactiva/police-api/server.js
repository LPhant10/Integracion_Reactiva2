const express = require("express")
const  {observable, from} = require("rxjs")
const {map,filter} = require("rxjs/operators")

const app = express()
const port = 3001

const data = [
    {id:5, dni:4376601, antecedentes:[] },
    {id:6, dni:4376602, antecedentes:[{name:'demanda por alimentos'} ] },
    {id:7, dni:4376603, antecedentes:[{name:'pertubar via publica'}] },
]

app.get("/api/police/:dni", (req, res)=>{
    console.log("REQUEST", new Date());
    let processData = [];
    const observable = from(data);
    observable.pipe(
        filter(e=>e.dni==req.params.dni),
        map( user => ({id:user.id, dni:user.dni, antecedentes:user.antecedentes}) )
    )
    .subscribe({
        next:value=>{ processData.push(value) },
        complete:()=>{ 
            console.log("RESPONSE", new Date());
            res.json(processData) }
    })
});

app.listen(port, ()=>{
    console.log("Listen POLICE in "+port);
});