import { randomColour } from "./utils";

function getText(node: Node): string {
  return (
    [...node.childNodes].filter(
      (childNode: Node) => childNode.nodeName === "w:t"
      // @ts-ignore
    )[0]?.innerHTML ?? ""
  );
}

function createOrReplaceColor(node: Node): Node {
  let colourFound = false;
  const newColor = document.createElement("w:color");
  newColor.setAttribute("w:val", randomColour());
  for (const childNode of node.childNodes) {
    if (childNode.nodeName == "w:color") {
      node.replaceChild(childNode, newColor);
      colourFound = true;
      continue;
    }
  }
  if (!colourFound) {
    node.appendChild(newColor);
  }

  return node;
}

// TODO: do we need to remove the colour attributes at paragraph level or
// does the word level override it?
function createNode(node: Node, character: string): Node {
  const clonedNode = node.cloneNode(true);
  // TODO: ensure "w:rPr" child element exists on `clonedNode`

  for (const childNode of clonedNode.childNodes) {
    if (childNode.nodeName == "w:rPr") {
      // create or replace color element
      clonedNode.replaceChild(childNode, createOrReplaceColor(childNode));
      continue;
    }
    if (childNode.nodeName == "w:t") {
      // @ts-ignore
      childNode.setAttribute("xml:space", "preserve");
      const textContent = childNode.firstChild;
      if (!textContent) {
        continue;
      }
      textContent.nodeValue = character;
    }
  }
  return clonedNode;
}

function isTextNode(node: Node): boolean {
  return (
    node.nodeName === "w:r" &&
    [...node.childNodes].some((childNode: Node) => childNode.nodeName === "w:t")
  );
}

function handleTextNode(node: Node): Node[] {
  // First, grab the inner text
  const text = getText(node);
  // Get individual characters
  const characters = text.split("");
  // Create new `w:r` elements for each character
  // and `xml:space="preserve"` for the space characters
  return characters.map((character: string) => createNode(node, character));
}

function handleNode(node: Node): Node[] {
  const clonedNode = node.cloneNode(false);

  if (isTextNode(node)) {
    return handleTextNode(node);
  }

  // Everything else we clone
  for (const childNode of node.childNodes) {
    const clonedChildNodes = handleNode(childNode);
    for (const clonedChildNode of clonedChildNodes) {
      clonedNode.appendChild(clonedChildNode);
    }
  }
  return [clonedNode];
}

export default function parseXML(text: string): string {
  const parser = new DOMParser();
  const document = parser.parseFromString(text, "text/xml");
  const newDocument = handleNode(document)[0];

  return new XMLSerializer().serializeToString(newDocument);
}
