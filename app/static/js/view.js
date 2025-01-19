
function setTricks(userIndex, trickCount) {
    let i = 0; 
    let tricksElement = document.querySelector(`#hand_${userIndex} > .tricks`);
    
    for (const trick of tricksElement.querySelectorAll(".trick")) {
        if (i++ < trickCount) trick.style.display = "block";
        else trick.style.display = "none";        
    }        
}

function setHand(cards) {
    const element = document.querySelector("#hand_0 > .cards");

    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }

    for (const card of cards) {
        const img = document.createElement('img');
        img.src = `../static/images/cards/large/${card}.png`;
        img.classList.add("card")
        element.dataset.card = card
        element.appendChild(img)
    }
}

function distributeHorizontally(parentSelector, gappercent = 0.0) {
    const parent = document.querySelector(parentSelector);
    const children = parent.children;
    const parentWidth = parent.offsetWidth;
    const childWidth = children[0]?.offsetWidth || 0; // Assume all children are the same width
    const gapabs = childWidth * gappercent;
    const totalChildWidth = childWidth * children.length;
    const totalGapWidth = gapabs * (children.length - 1);
    const totalSpace = totalChildWidth + totalGapWidth;
    const startX = (parentWidth - totalSpace) / 2;

    Array.from(children).forEach((child, index) => {
        const xPosition = startX + index * (childWidth + gapabs);
        child.style.position = "absolute";
        child.style.left = `${xPosition}px`;
    });
}

window.updateView = updateView
function updateView(snapshot) {
    window.snapshot = snapshot
    console.log(snapshot)
    setTricks(0, 0)
    setTricks(1, 0)
    setTricks(2, 0)
    setTricks(3, 0)

    // set the hand cards
    setHand(snapshot.hand)

    // set scoreing cards
    document.querySelector("#score_0").setAttribute("data-value", snapshot.score[0]);
    document.querySelector("#score_1").setAttribute("data-value", snapshot.score[1]);
}

(() => {
    window.addEventListener("load", () => {
        setHand(["K\u2663", "9\u2665", "A\u2660", "A\u2666", "10\u2660"]);

        setTimeout(() => {
            distributeHorizontally("#hand_0 > .cards", -0.6);
            distributeHorizontally("#hand_1 > .cards", -0.6);
            distributeHorizontally("#hand_2 > .cards", -0.6);
            distributeHorizontally("#hand_3 > .cards", -0.6);
            distributeHorizontally("#button_container", 0.05);
        }, 100); // Adjust the delay as needed (100ms)
    });

    window.addEventListener("resize", () => {
        distributeHorizontally("#hand_0 > .cards", -0.6);
        distributeHorizontally("#hand_1 > .cards", -0.6);
        distributeHorizontally("#hand_2 > .cards", -0.6);
        distributeHorizontally("#hand_3 > .cards", -0.6);
        distributeHorizontally("#button_container", 0.05);
    });
})();