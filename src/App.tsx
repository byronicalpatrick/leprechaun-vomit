import React from "react";
import JSZip from "jszip";

import parseXML from "./vomit";

async function unzip(
  event: React.ChangeEvent<HTMLInputElement>,
  setResult: Function
) {
  if (!event.target.files) {
    return;
  }
  const file = event.target.files[0];
  const result = await JSZip.loadAsync(file);
  const document = result.file("word/document.xml");
  if (!document) {
    return;
  }

  const documentString = await document?.async("string");
  const newDocumentString = parseXML(documentString);

  // TODO: do all these options cover everything?
  result.file("word/document.xml", newDocumentString, {
    dir: document.dir,
    date: document.date,
    comment: document.comment,
    unixPermissions: document.unixPermissions,
    dosPermissions: document.dosPermissions,
  });
  const output = await result.generateAsync({
    type: "base64",
    compression: "DEFLATE",
    mimeType: file.type,
  });
  setResult(`data:${file.type};base64,${output}`);
}

function App() {
  const [result, setResult] = React.useState(undefined);

  return (
    <>
      <div>
        <h1>Leprechaun Vomit</h1>
        <div>
          <h2>How to use</h2>
          <p>Select a docx file to raindowify below</p>
        </div>
      </div>
      <div>
        <label>
          <input
            type="file"
            onChange={(event) => unzip(event, setResult)}
            accept=".docx"
          />
          Spew!
        </label>
      </div>
      <div>
        <a download="vomit.docx" href={result}>
          {result && "Here is your vomit"}
        </a>
      </div>
    </>
  );
}

export default App;
