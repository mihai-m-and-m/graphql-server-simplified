import data from "../data.json" assert { type: "json" };
console.log(data);

document.getElementById("myText").innerHTML = JSON.stringify(data, null, 4);
