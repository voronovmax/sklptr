const STORAGE_KEY = 'sklptr:selectors';
let isControlKeyPressed = false;
let hoveredElement = null;

function onMouseOver(event) {
  hoveredElement = event.target;
  hoveredElement.style.outline = '5px solid green';
}

function onMouseOut(event) {
  event.target.style.outline = 'none';
  hoveredElement = null
}

function onRemove(event) {
  if (!event.ctrlKey || event.key !== 'x' || hoveredElement === null) {
    return;
  }

  const selector = generateSelector(hoveredElement)
  const matchingElements = document.querySelectorAll(selector);
  // Don't remove element if it's selector matches multiple elements.
  if (matchingElements.length > 1) {
    hoveredElement.style.outline = '5px solid red';
    return;
  }
  addSelector(selector);
  hoveredElement.remove();
}

addEventListener('keydown', event => {
  if (event.key !== 'Control') {
    return;
  }
  isControlKeyPressed = true;
  document.addEventListener('mouseover', onMouseOver)
  document.addEventListener('mouseout', onMouseOut);
  document.addEventListener('keydown', onRemove);
})

addEventListener('keyup', event => {
  if (event.key !== 'Control') {
    return;
  }
  isControlKeyPressed = false;
  document.removeEventListener('mouseover', onMouseOver)
  document.removeEventListener('mouseout', onMouseOut);
  document.removeEventListener('keydown', onRemove);

  hoveredElement.style.outline = 'none';
})

function getSelectors() {
  let selectors = localStorage.getItem(STORAGE_KEY);
  return selectors === null ? [] : JSON.parse(selectors);
}

function addSelector(selector) {
  const selectors = getSelectors();
  selectors.push(selector);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(selectors))
}

function isValidSelector(selector) {
  try {
    // Ref: https://stackoverflow.com/questions/34849001/check-if-css-selector-is-valid
    document.createDocumentFragment().querySelector(selector)
  } catch {
    return false
  }
  return true
}

function generateSelector(element) {
  const elementAttributes = element.attributes;
  let selector = element.tagName.toLowerCase();
  for (const { name, value } of elementAttributes) {
    // We change the element style to add an outline.
    // When the page will be loaded again the style won't
    // persist and we won't be able to hide the element.
    // Thus we ignore the style attribute.
    if (name === 'style') {
      continue;
    }
    const selectorPart = `[${name}="${value}"]`;
    if (!isValidSelector(selector + selectorPart)) {
      continue;
    }
    selector += selectorPart;
  }
  return selector;
}

const htmlHeadElement = (
  document.head ||
  document.getElementsByTagName('head')[0]
)
const styleElement = document.createElement('style');
htmlHeadElement.appendChild(styleElement);

let cssString = '';
for (const selector of getSelectors()) {
  const elements = document.querySelectorAll(selector);
  if (elements.length === 0) {
    continue;
  }

  // If somehow we ended up with a selector that
  // matches multiple elements we want to alert.
  if (elements.length > 1) {
    alert('Got multiple elements for a selector: ' + selector);
    continue;
  }

  cssString += `
    ${selector} {
      display: none !important;
    }
  `
}

styleElement.appendChild(document.createTextNode(cssString));
