
function setHand(cards) {
    const element = document.querySelector("#hand_0");
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
    const availableSpace = parentWidth - totalChildWidth - totalGapWidth;
    const startX = availableSpace / 2;

    Array.from(children).forEach((child, index) => {
        const xPosition = startX + index * (childWidth + gapabs);
        child.style.position = "absolute";
        child.style.left = `${xPosition}px`;
    });
}

function distributeVertically(parentSelector, gappercent = 0.0) {
    const parent = document.querySelector(parentSelector);
    const children = parent.children;
    const parentWidth = parent.offsetWidth;
    const childWidth = children[0]?.offsetWidth || 0; // Assume all children are the same width
    const gapabs = childWidth * gappercent;
    const totalChildWidth = childWidth * children.length;
    const totalGapWidth = gapabs * (children.length - 1);
    const availableSpace = parentWidth - totalChildWidth - totalGapWidth;
    const startY = availableSpace / 2;

    Array.from(children).forEach((child, index) => {
        const yPosition = startY + index * (childWidth + gapabs);
        child.style.position = "absolute";
        child.style.top = `${yPosition}px`;
    });
}


(()=>{
    window.addEventListener("load", () => {
        setHand(["K\u2663", "9\u2665", "A\u2660", "A\u2666", "10\u2660"]);

        setTimeout(() => {
            distributeHorizontally("#hand_0", -0.6);
            distributeHorizontally("#hand_1", -0.6);
            distributeHorizontally("#hand_2", -0.6);
            distributeHorizontally("#hand_3", -0.6);
            distributeHorizontally("#button_container", 0.05);
        }, 100); // Adjust the delay as needed (100ms)
    });

    window.addEventListener("resize", () => {
        distributeHorizontally("#hand_0", -0.6);
        distributeHorizontally("#hand_1", -0.6);
        distributeHorizontally("#hand_2", -0.6);
        distributeHorizontally("#hand_3", -0.6);
        distributeHorizontally("#button_container", 0.05);
    });
})();