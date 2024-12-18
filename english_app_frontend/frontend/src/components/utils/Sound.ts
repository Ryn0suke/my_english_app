const soundUp = (word:string) => {
    let u = new SpeechSynthesisUtterance();
    u.lang = 'en-US';
    u.text = word;
    speechSynthesis.speak(u);
}

export default soundUp;
