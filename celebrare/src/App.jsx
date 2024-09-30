import { useState, useRef, useEffect } from "react";

function App() {
  const [texts, setTexts] = useState([]);
  const [newText, setNewText] = useState("");
  const [font, setFont] = useState("Arial");
  const [fontSize, setFontSize] = useState(20);
  const [selectedTextIndex, setSelectedTextIndex] = useState(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const canvasRef = useRef(null);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    texts.forEach((textObj, index) => {
      const {
        text,
        position,
        font,
        fontSize,
        isBold,
        isItalic,
        isUnderline,
        isStrikethrough,
        selected,
      } = textObj;

      ctx.font = `${isBold ? "bold" : ""} ${
        isItalic ? "italic" : ""
      } ${fontSize}px ${font}`;
      ctx.textBaseline = "top";

      ctx.fillText(text, position.x, position.y);

      const textWidth = ctx.measureText(text).width;

      if (selected) {
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.strokeRect(
          position.x - 5,
          position.y - 5,
          textWidth + 10,
          fontSize + 10
        );
      }

      if (isUnderline) {
        ctx.beginPath();
        ctx.moveTo(position.x, position.y + fontSize + 2);
        ctx.lineTo(position.x + textWidth, position.y + fontSize + 2);
        ctx.stroke();
      }

      if (isStrikethrough) {
        ctx.beginPath();
        ctx.moveTo(position.x, position.y + fontSize / 2);
        ctx.lineTo(position.x + textWidth, position.y + fontSize / 2);
        ctx.stroke();
      }
    });
  };

  useEffect(() => {
    drawCanvas();
  }, [texts]);

  const handleCanvasClick = () => {
    setSelectedTextIndex(null);
    setTexts((prevTexts) =>
      prevTexts.map((textObj) => ({ ...textObj, selected: false }))
    );
  };

  const addNewText = () => {
    if (newText.trim() === "") return;

    const newTextObject = {
      text: newText,
      position: { x: 50, y: 50 },
      font,
      fontSize,
      isBold: false,
      isItalic: false,
      isUnderline: false,
      isStrikethrough: false,
      selected: false,
    };

    setTexts((prevTexts) => [...prevTexts, newTextObject]);
    setNewText("");
  };

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    const { offsetX, offsetY } = e.nativeEvent;

    const clickedTextIndex = texts.findIndex((textObj) => {
      const { text, position } = textObj;
      const textWidth = canvas.getContext("2d").measureText(text).width;

      return (
        offsetX >= position.x &&
        offsetX <= position.x + textWidth &&
        offsetY >= position.y &&
        offsetY <= position.y + textObj.fontSize
      );
    });

    if (clickedTextIndex !== -1) {
      setSelectedTextIndex(clickedTextIndex);
      setFontSize(texts[clickedTextIndex].fontSize); // Update fontSize based on the clicked text
      setFont(texts[clickedTextIndex].font); // Update font based on the clicked text
      setTexts((prevTexts) =>
        prevTexts.map((textObj, index) => ({
          ...textObj,
          selected: index === clickedTextIndex,
        }))
      );
      setIsDragging(true);
      const selectedText = texts[clickedTextIndex];
      setOffset({
        x: offsetX - selectedText.position.x,
        y: offsetY - selectedText.position.y,
      });
    } else {
      handleCanvasClick();
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && selectedTextIndex !== null) {
      const { offsetX, offsetY } = e.nativeEvent;

      setTexts((prevTexts) =>
        prevTexts.map((textObj, index) =>
          index === selectedTextIndex
            ? {
                ...textObj,
                position: {
                  x: offsetX - offset.x,
                  y: offsetY - offset.y,
                },
              }
            : textObj
        )
      );
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const toggleBold = () => {
    if (selectedTextIndex === null) return;
    setTexts((prevTexts) =>
      prevTexts.map((textObj, index) =>
        index === selectedTextIndex
          ? { ...textObj, isBold: !textObj.isBold }
          : textObj
      )
    );
  };

  const toggleItalic = () => {
    if (selectedTextIndex === null) return;
    setTexts((prevTexts) =>
      prevTexts.map((textObj, index) =>
        index === selectedTextIndex
          ? { ...textObj, isItalic: !textObj.isItalic }
          : textObj
      )
    );
  };

  const toggleUnderline = () => {
    if (selectedTextIndex === null) return;
    setTexts((prevTexts) =>
      prevTexts.map((textObj, index) =>
        index === selectedTextIndex
          ? { ...textObj, isUnderline: !textObj.isUnderline }
          : textObj
      )
    );
  };

  const toggleStrikethrough = () => {
    if (selectedTextIndex === null) return;
    setTexts((prevTexts) =>
      prevTexts.map((textObj, index) =>
        index === selectedTextIndex
          ? { ...textObj, isStrikethrough: !textObj.isStrikethrough }
          : textObj
      )
    );
  };

  const changeFont = (e) => {
    const newFont = e.target.value;
    setFont(newFont);
    if (selectedTextIndex === null) return;
    setTexts((prevTexts) =>
      prevTexts.map((textObj, index) =>
        index === selectedTextIndex ? { ...textObj, font: newFont } : textObj
      )
    );
  };

  const changeFontSize = (e) => {
    const newSize = parseInt(e.target.value);
    setFontSize(newSize); // Update fontSize state to keep track of the selected size
    if (selectedTextIndex === null) return;
    setTexts((prevTexts) =>
      prevTexts.map((textObj, index) =>
        index === selectedTextIndex
          ? { ...textObj, fontSize: newSize }
          : textObj
      )
    );
  };

  return (
    <div className="flex justify-center item-center">
      <div className="my-16">
        <h1 className="text-3xl font-bold text-center pb-5 ">
          Canvas with Multiple Draggable Texts
        </h1>
        <canvas
          ref={canvasRef}
          width="700"
          height="400"
          className="border-2 border-black"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        ></canvas>
        <div className="flex justify-between items-center mt-1 p-1">
          <div className="flex items-center">
            <label className="mr-2 text-xl font-bold">Font:</label>
            <select
              onChange={changeFont}
              value={font}
              className="mr-4 border-2 border-black p-1"
            >
              <option value="Arial">Arial</option>
              <option value="Verdana">Verdana</option>
              <option value="Times New Roman">Times New Roman</option>
            </select>
          </div>
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="Enter new text"
              className="border-2 border-black p-2"
            />
            <button
              onClick={addNewText}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Add Text
            </button>
          </div>
          <div className="flex items-center">
            <label className="mr-2 text-xl font-bold">Font Size:</label>
            <select
              onChange={changeFontSize}
              value={fontSize}
              className="mr-4 border border-black p-1"
            >
              {[...Array(16)].map((_, i) => (
                <option key={i} value={10 + i * 2}>
                  {10 + i * 2}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-5 justify-center mt-2">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={toggleBold}
          >
            Bold
          </button>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={toggleItalic}
          >
            Italic
          </button>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={toggleUnderline}
          >
            Underline
          </button>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={toggleStrikethrough}
          >
            Strikethrough
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
