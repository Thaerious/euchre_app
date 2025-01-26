export function distributeHorizontally(parentSelector, gappercent = 0.0) {
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