let lastX = 0;
let lastY = 0;

document.addEventListener("mousemove", (event) => {
    const deltaX = event.clientX - lastX;
    const deltaY = event.clientY - lastY;
    const totalDistance = Math.sqrt(deltaX ** 2 + deltaY ** 2);

    // Check distance moved 
    if (totalDistance > 60) {
        const response = getRandomResponse(responses.mouseMove);
        displayNewText(response, 50); // speed
    }

    // Update last mouse position
    lastX = event.clientX;
    lastY = event.clientY;
});

document.addEventListener("click", () => {
    const response = getRandomResponse(responses.mouseClick);
    displayNewText(response, 50); // speed
});

function getRandomResponse(responsesArray) {
    const randomIndex = Math.floor(Math.random() * responsesArray.length);
    return responsesArray[randomIndex];
}

function createNewTextElement(x, y) {
    const newElement = document.createElement('div');
    newElement.className = 'text-element';
    newElement.style.opacity = 0; // opacity
    document.getElementById('container').appendChild(newElement);
    setLocation(newElement, x, y);
    return newElement;
}

async function displayNewText(text, typingSpeed) {
    const x = Math.floor(Math.random() * (window.innerWidth - 200)); 
    const y = Math.floor(Math.random() * (window.innerHeight - 50)); 

    // Decrease opacity 
    const textElements = document.querySelectorAll('.text-element');
    textElements.forEach(element => {
        element.style.opacity = parseFloat(element.style.opacity) - 0.1; // opacity
    });

    const newTextElement = createNewTextElement(x, y);
    await fadeInElement(newTextElement, 100); 
    await typeWriter(newTextElement, text, typingSpeed); 
}

function setLocation(element, x, y) {
    element.style.position = 'absolute';
    element.style.top = y + 'px';
    element.style.left = x + 'px';
}

async function fadeInElement(element, duration) {
    const start = performance.now();
    while (performance.now() - start < duration) {
        element.style.opacity = (performance.now() - start) / duration;
        await sleep(10);
    }
    element.style.opacity = 1;
}

async function typeWriter(element, text, typingSpeed) {
    for (let i = 0; i < text.length; i++) {
        element.textContent += text.charAt(i);
        await sleep(1000 / typingSpeed);
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const responses = {
    mouseMove: [
        "Your identity is valid and worthy of respect.",
        "It's okay to be unsure or questioning.",
        "Your journey is unique and important.",
        "You have the right to define your own experiences.",
        "Self-discovery is a lifelong process.",
        "You are not alone in your feelings or experiences.",
        "Your happiness doesn't have to depend on romantic relationships.",
        "There is beauty in embracing your authentic self.",
        "You deserve love and acceptance, regardless of your orientation.",
        "Your worth is not determined by your relationship status.",
        "It's okay to prioritize your own well-being and happiness.",
        "You are deserving of understanding and support.",
        "There is strength in being true to yourself.",
        "Your boundaries are valid and important to uphold.",
        "You are enough just as you are.",
        "You have the power to create your own definition of love and fulfillment.",
        "You deserve to take up space and be heard.",
        "You are worthy of love and belonging.",
        "Your feelings and experiences are valid, even if they differ from others.",
        "You have the right to choose your own path in life.",
        "It's okay to celebrate platonic and non-romantic connections.",
        "Your identity is multifaceted and beautiful.",
        "You are deserving of kindness, compassion, and understanding.",
        "You are stronger than you think.",
        "Your presence enriches the world around you.",
        "It's okay to take breaks and prioritize self-care.",
        "Your happiness matters, no matter what anyone else says.",
        "You are capable of creating meaningful connections and relationships.",
        "You are not defined by societal expectations or norms.",
        "You have the power to rewrite your own narrative.",
        "Your identity is not a phase or a trend—it's valid and real.",
        "It's okay to embrace your asexuality and aromanticism fully.",
        "Your voice matters, and your experiences are valuable.",
        "You deserve to be treated with love, respect, and dignity.",
        "There is strength in vulnerability and authenticity.",
        "You are deserving of love, joy, and fulfillment in all aspects of your life.",
        "You are not alone in your journey of self-discovery and acceptance.",
        "It's okay to seek out communities and spaces where you feel understood and accepted.",
        "Your identity is a beautiful and integral part of who you are.",
        "You are worthy of love and belonging just as you are.",
        "It's okay to take your time in exploring and understanding your orientation and identity.",
        "Your feelings are valid and worthy of acknowledgment and validation.",
        "There is no one right way to be ace or aro—your experience is uniquely yours.",
        "You are enough, just as you are, and you deserve to be celebrated.",
        "It's okay to set boundaries and prioritize your own well-being.",
        "Your identity is not a flaw or a limitation—it's a beautiful aspect of your whole self.",
        "You have the power to shape your own narrative and define your own happiness.",
        "It's okay to seek out support and resources that affirm and validate your identity.",
        "Your worth is inherent and not dependent on external validation.",
        "You deserve to be seen, heard, and respected for who you truly are.",
        "It's okay to take breaks and focus on self-care and self-compassion.",
        "Your identity is valid, no matter what anyone else says or believes.",
        "You are deserving of love, respect, and acceptance, just as you are.",
        "It's okay to embrace your orientation and identity with pride and confidence.",
        "Your journey of self-discovery is a testament to your strength and resilience.",
        "You have the power to create meaningful connections and relationships on your own terms.",
        "Your experiences are valuable and deserving of acknowledgment and validation.",
    ],
    mouseClick: [
        "It's okay to prioritize your own happiness and well-being above societal expectations.",
        "Your identity is beautiful and worthy of celebration.",
        "You are not alone in your experiences, and there is support and community available to you.",
        "It's okay to celebrate all forms of love and connection in your life.",
        "Your orientation and identity are valid, no matter what others may say or believe.",
        "You have the right to define your own happiness and fulfillment, independent of societal norms.",
        "Your journey of self-discovery is unique and valid, and you deserve to explore it at your own pace.",
        "It's okay to seek out relationships and connections that align with your values and identity.",
        "Your voice and perspective are valuable and worthy of being heard.",
        "You are deserving of love, acceptance, and understanding, just as you are.",
        "It's okay to take breaks and prioritize self-care and self-compassion.",
        "Your identity is an integral part of who you are, and it deserves to be celebrated and respected.",
        "You have the right to set boundaries and advocate for your own needs and desires.",
        "Your identity is valid and worthy of affirmation, no matter what anyone else may say.",
        "It's okay to seek out communities and spaces where you feel understood, accepted, and valued.",
        "Your experiences and feelings are valid, and you deserve to express them authentically.",
        "You are deserving of love, respect, and acceptance in all aspects of your life.",
        "It's okay to embrace your identity with pride and confidence, knowing that you are worthy of love and belonging.",
        "Your journey of self-discovery is ongoing, and it's okay to take your time in exploring and understanding yourself.",
        "You are not alone in your experiences, and there are others who understand and support you.",
        "It's okay to seek out resources and support that affirm and validate your identity and experiences.",
        "Your orientation and identity are valid, and you deserve to live authentically and unapologetically.",
        "You have the right to define your own path and pursue happiness on your own terms.",
        "Your identity is beautiful and worthy of celebration, and you deserve to be seen and respected for who you truly are.",
        "It's okay to prioritize your own well-being and happiness, even if it means setting boundaries and saying no to others.",
        "Your identity is an integral part of who you are, and it deserves to be honored and respected by yourself and others.",
        "You are deserving of love, acceptance, and understanding, and you have the right to seek out relationships and connections that fulfill you.",
        "It's okay to take breaks and prioritize self-care and self-compassion, knowing that your well-being is important and worthy of attention.",
        "Your orientation and identity are valid and deserving of affirmation, and you deserve to live authentically and unapologetically in accordance with your true self.",
        "You have the right to express your identity openly and proudly, and you deserve to be celebrated and supported for who you are.",
        "Your experiences and feelings are valid and deserving of acknowledgment, and you deserve to feel seen, heard, and respected in all aspects of your life.",
        "It's okay to seek out communities and spaces where you feel understood, accepted, and valued, and to surround yourself with people who uplift and support you.",
        "Your identity is unique and beautiful, and it deserves to be celebrated and embraced with love, pride, and confidence.",
        "You are not alone in your experiences, and there are others who understand and empathize with you, offering support, understanding, and solidarity.",
        "It's okay to seek out resources and support that affirm and validate your identity and experiences, and to prioritize your own well-being and happiness above all else.",
        "Your orientation and identity are valid and worthy of affirmation, and you deserve to live authentically and unapologetically in accordance with your true self.",
        "You have the right to define your own path and pursue happiness on your own terms, and to seek out relationships and connections that honor and celebrate your identity.",
        "Your identity is beautiful and worthy of celebration, and you deserve to be seen, respected, and loved for who you truly are, both by yourself and by others.",
        "It's okay to prioritize your own well-being and happiness, even if it means setting boundaries and saying no to others, because your mental and emotional health matter.",
        "Your identity is an integral part of who you are, and it deserves to be honored and respected by yourself and by others, because you are deserving of love, acceptance, and understanding.",
        "You are deserving of love, acceptance, and understanding, and you have the right to seek out relationships and connections that fulfill you, support you, and honor your identity.",
        "It's okay to take breaks and prioritize self-care and self-compassion, knowing that your well-being is important and worthy of attention, and that you deserve to be kind to yourself.",
        "Your orientation and identity are valid and deserving of affirmation, and you deserve to live authentically and unapologetically in accordance with your true self, because you are enough, just as you are.",
        "You have the right to express your identity openly and proudly, and you deserve to be celebrated and supported for who you are, because your experiences and feelings are valid and deserving of acknowledgment.",
        "Your identity is unique and beautiful, and it deserves to be celebrated and embraced with love, pride, and confidence, because you are not alone in your experiences, and there are others who understand and empathize with you.",
        "It's okay to seek out communities and spaces where you feel understood, accepted, and valued, and to surround yourself with people who uplift and support you, because you are deserving of love, acceptance, and understanding.",
        "Your identity is valid and worthy of affirmation, and you deserve to live authentically and unapologetically in accordance with your true self, because you have the right to define your own path and pursue happiness on your own terms.",
        "You are deserving of love, acceptance, and understanding, and you have the right to seek out relationships and connections that fulfill you, support you, and honor your identity, because you are enough, just as you are.",
        "It's okay to prioritize your own well-being and happiness, even if it means setting boundaries and saying no to others, because your mental and emotional health matter, and you deserve to prioritize yourself.",
        "Your identity is an integral part of who you are, and it deserves to be honored and respected by yourself and by others, because you are deserving of love, acceptance, and understanding, just as you are.",
        "You have the right to express your identity openly and proudly, and you deserve to be celebrated and supported for who you are, because your experiences and feelings are valid and deserving of acknowledgment, and you are enough, just as you are.",
        "Your identity is unique and beautiful, and it deserves to be celebrated and embraced with love, pride, and confidence, because you are not alone in your experiences, and there are others who understand and empathize with you, offering support, understanding, and solidarity.",
        "It's okay to seek out communities and spaces where you feel understood, accepted, and valued, and to surround yourself with people who uplift and support you, because you are deserving of love, acceptance, and understanding, and you have the right to prioritize your own well-being and happiness, because you are enough, just as you are.",
        "Your identity is valid and worthy of affirmation, and you deserve to live authentically and unapologetically in accordance with your true self, because you have the right to define your own path and pursue happiness on your own terms, and to seek out relationships and connections that fulfill you, support you, and honor your identity, because you are deserving of love, acceptance, and understanding, just as you are."
    ]
};
