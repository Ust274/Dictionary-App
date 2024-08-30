const form = document.getElementById("txt-form");
const display = document.getElementById("display-box");

async function getDict(inp) {
    try{
        let data = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${inp}`);
        const newdata = await data.json();
        console.log(newdata[0].meanings[0].definitions[0]);
        console.log(newdata[0]);
        const audioURL = newdata[0].phonetics.find(phonetic => phonetic.audio)?.audio;
        console.log('Audio URL:', audioURL);

        display.innerHTML="";
        const def1 = document.createElement("h2");
        const def2 = document.createElement("p");
        const des= document.createElement("p");
        const audioElement = document.createElement("audio");
        if (audioURL) {
            audioElement.src = audioURL;
            audioElement.controls = true; // Add controls to allow play/pause
            audioElement.classList.add("audio");
        } else {
            audioElement.textContent = "Audio not available";
        }


        def1.textContent = inp.charAt(0).toUpperCase() + inp.slice(1);
        def2.textContent= newdata[0].phonetic +" | "+ newdata[0].meanings[0].partOfSpeech;
        des.textContent =newdata[0].meanings[0].definitions[0].definition;



        
        display.appendChild(def1);
        display.appendChild(def2);
        display.appendChild(des);
        if (audioURL) display.appendChild(audioElement);





        def1.classList.add("word")
        des.classList.add("des")
        def2.classList.add("ahh")
        //syno.classList.add("syno")
        //def3.classList.add("sound")

    }
    catch(error){
        console.error(error);
        display.innerHTML="Word not found!!!!";
    }
    
}


form.addEventListener('submit', (e) => {
 e.preventDefault();
 const inp = document.getElementById("txt-input").value;
 if(inp===""){
    console.log("......")

 }
else{
    getDict(inp)
}
});


