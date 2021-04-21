import {fromEvent}  from "rxjs";
import {filter} from 'rxjs/operators';
import { pipe,tap } from 'ramda';
import {run} from './interpreter';
import {getValue} from './interpreter';



const acorn = require("acorn");




let input = document.querySelector('#input');
let history: string[] = [];
let histCount = 0;

const keyUps = fromEvent(input, 'keyup');
const keyDowns = fromEvent(input, 'keydown');
const keyEnter = keyUps.pipe(
    filter((e: KeyboardEvent) => e.keyCode === 13)
);

keyUps.pipe(
    filter((e: KeyboardEvent) => e.keyCode === 38),
    
    )
    
    
    .subscribe(function() {
    if (histCount >= 0 && histCount < history.length) {
        let value1 = history[histCount];
        histCount = histCount +1;
        document.querySelector('input').value = value1;
    }
})

keyDowns.pipe(
    filter((e: KeyboardEvent) => e.keyCode === 40)
    )
    .subscribe(function() {
        if (histCount <= history.length && histCount > 0) {
            histCount = histCount - 1; 
            let value2 = history[histCount];
            document.querySelector('input').value = value2;
        }
    })


    keyEnter.subscribe(function () {
        let value = (<HTMLInputElement>event.target).value.trim();
        
        let eValue = "";
        if (value) {
            if (value == "clear") {
                history.unshift(value);
                document.querySelector('input').value = "";
                return document.getElementById("output").innerHTML = "";
            }
            else if (!/(var|let|const)/.test(value)) {
                eValue = `print(${value})`;
            }
        }
        try {
            const body = acorn.parse(eValue || value, { ecmaVersion: 2020 }).body;
            // console.log(body,history)
            run(body);
        let answer = getValue();
        const finalResult = answer ? value + " = " + answer : value;
        let textNode =  document.createTextNode(finalResult);
        let node = document.createElement("li");
        node.appendChild(textNode);
        document.getElementById("output").appendChild(node);
        history.unshift(value);
        histCount=0;
        }
        catch {
            console.log("error");
        }
        document.querySelector('input').value = "";
    })

// console.log(keyUps,keyDowns,histCount,history)
